#!/usr/bin/env python3

"""Sync the videos dataset from a YouTube playlist feed.

This keeps the site static while automatically adding new playlist uploads
into assets/data/videos.json. Existing curated entries are preserved.
"""

from __future__ import annotations

import argparse
import copy
import datetime as dt
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


PLAYLIST_ID = "PLfrySFqYRf2f76AVCxdgpXuH0jwdD-80f"
PLAYLIST_TITLE = "Vibe Coding On Steam Deck"
CHANNEL_NAME = "Shaun Roselt"
SERIES_SLUG = "vibe-coding"


def repo_root() -> Path:
    return Path(__file__).resolve().parent


def videos_path() -> Path:
    return repo_root() / "assets" / "data" / "videos.json"


def fetch_playlist_feed(playlist_id: str) -> ET.Element:
    feed_url = f"https://www.youtube.com/feeds/videos.xml?playlist_id={playlist_id}"
    request = urllib.request.Request(feed_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = response.read()
    return ET.fromstring(payload)


def strip_whitespace(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def short_description(value: str | None, max_length: int = 180) -> str:
    text = strip_whitespace(value)
    if not text:
        return ""

    first_sentence = re.split(r"(?<=[.!?])\s+", text, maxsplit=1)[0]
    candidate = first_sentence if len(first_sentence) <= max_length else text
    if len(candidate) <= max_length:
        return candidate
    return candidate[: max_length - 1].rstrip() + "…"


def format_date(value: str | None) -> str:
    if not value:
        return ""

    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return value

    return parsed.strftime("%b %d, %Y").replace(" 0", " ")


def format_views(value: str | None) -> str:
    if not value:
        return ""
    return f"{value} views"


def extract_video_id(item: dict) -> str:
    item_id = strip_whitespace(item.get("id"))
    if item_id.startswith("yt-"):
        return item_id[3:]

    media = item.get("media") or {}
    src = strip_whitespace(media.get("src"))
    if src:
        match = re.search(r"/embed/([A-Za-z0-9_-]+)", src)
        if match:
            return match.group(1)

    for link in item.get("links") or []:
        href = strip_whitespace(link.get("href"))
        match = re.search(r"[?&]v=([A-Za-z0-9_-]+)", href)
        if match:
            return match.group(1)

    return ""


def load_existing_items(path: Path) -> list[dict]:
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    if isinstance(payload, list):
        return payload

    if isinstance(payload, dict) and isinstance(payload.get("items"), list):
        return payload["items"]

    return []


def build_existing_map(items: list[dict]) -> dict[str, dict]:
    mapping: dict[str, dict] = {}

    for item in items:
        if not isinstance(item, dict):
            continue

        video_id = extract_video_id(item)
        if video_id:
            mapping[video_id] = item

    return mapping


def parse_entry(entry: ET.Element) -> dict:
    namespaces = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "media": "http://search.yahoo.com/mrss/",
    }

    video_id = strip_whitespace(entry.findtext("yt:videoId", namespaces=namespaces))
    title = strip_whitespace(entry.findtext("atom:title", namespaces=namespaces)) or f"YouTube video {video_id}"
    video_url = f"https://www.youtube.com/watch?v={video_id}"

    for link in entry.findall("atom:link", namespaces):
        if link.attrib.get("rel") == "alternate":
            video_url = strip_whitespace(link.attrib.get("href")) or video_url
            break

    media_group = entry.find("media:group", namespaces)
    description = ""
    thumbnail_url = ""
    views = ""

    if media_group is not None:
        description = strip_whitespace(media_group.findtext("media:description", namespaces=namespaces))
        thumbnail = media_group.find("media:thumbnail", namespaces)
        if thumbnail is not None:
            thumbnail_url = strip_whitespace(thumbnail.attrib.get("url"))
        statistics = media_group.find("media:community/media:statistics", namespaces)
        if statistics is not None:
            views = strip_whitespace(statistics.attrib.get("views"))

    published = strip_whitespace(entry.findtext("atom:published", namespaces=namespaces))

    return {
        "id": f"yt-{video_id}",
        "video_id": video_id,
        "name": title,
        "summary": short_description(description) or short_description(title),
        "ownership": "personal",
        "series": SERIES_SLUG,
        "tags": [],
        "features": [value for value in [format_date(published), format_views(views)] if value],
        "media": {
            "kind": "iframe",
            "src": f"https://www.youtube.com/embed/{video_id}",
            "title": title,
            "sandbox": "allow-scripts allow-same-origin",
            "fallback": {
                "kind": "image",
                "src": thumbnail_url or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                "alt": f"{title} thumbnail",
            },
        },
        "links": [
            {
                "href": video_url,
                "title": "Watch on YouTube",
                "ariaLabel": "Watch on YouTube",
                "icon": "bi-youtube",
                "style": "primary",
                "target": "_blank",
                "rel": "noreferrer noopener",
            }
        ],
    }


def merge_playlist_items(existing_items: list[dict], feed_entries: list[ET.Element]) -> list[dict]:
    existing_by_video_id = build_existing_map(existing_items)
    merged_items: list[dict] = []
    seen: set[str] = set()

    for entry in feed_entries:
        parsed = parse_entry(entry)
        video_id = parsed["video_id"]
        seen.add(video_id)
        merged_items.append(copy.deepcopy(existing_by_video_id.get(video_id, parsed)))

    for item in existing_items:
        video_id = extract_video_id(item)
        if video_id and video_id not in seen:
            merged_items.append(item)

    return merged_items


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync videos.json from a YouTube playlist feed")
    parser.add_argument("--write", action="store_true", help="Write the updated JSON back to disk")
    args = parser.parse_args()

    path = videos_path()
    existing_items = load_existing_items(path)

    try:
        root = fetch_playlist_feed(PLAYLIST_ID)
    except Exception as error:
        print(f"Failed to fetch playlist feed: {error}", file=sys.stderr)
        return 1

    feed_entries = list(root.findall("{http://www.w3.org/2005/Atom}entry"))
    updated_items = merge_playlist_items(existing_items, feed_entries)

    payload = json.dumps(updated_items, indent=4, ensure_ascii=False) + "\n"
    current_payload = path.read_text(encoding="utf-8") if path.exists() else ""

    if payload == current_payload:
        print("videos.json is already in sync with the playlist.")
        return 0

    if args.write:
        path.write_text(payload, encoding="utf-8")
        print(f"Updated {path.relative_to(repo_root())} from {PLAYLIST_TITLE} ({CHANNEL_NAME}).")
    else:
        print(payload)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())