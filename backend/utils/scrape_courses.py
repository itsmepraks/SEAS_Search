import os
import re
import time
from datetime import datetime

import pandas as pd
import requests
from bs4 import BeautifulSoup

# ============================================================================
# CONFIGURATION - Add more subjects here easily!
# ============================================================================
SUBJECTS = {
    "CSCI": {
        "schedule_id": "CSCI",
        "bulletin_url": "https://bulletin.gwu.edu/courses/csci/",
        "full_name": "Computer Science"
    },
    "DS": {
        "schedule_id": "DATS",
        "bulletin_url": "https://bulletin.gwu.edu/courses/dats/",
        "full_name": "Data Science"
    },
    # Easy to add more subjects:
    # "MATH": {
    #     "schedule_id": "MATH",
    #     "bulletin_url": "https://bulletin.gwu.edu/courses/math/",
    #     "full_name": "Mathematics"
    # },
    # "STAT": {
    #     "schedule_id": "STAT",
    #     "bulletin_url": "https://bulletin.gwu.edu/courses/stat/",
    #     "full_name": "Statistics"
    # },
}

# Term configuration
DEFAULT_TERM_ID = 202601  # Spring 2026
DEFAULT_CAMPUS_ID = 1

def scrape_subject_bulletin(subject_code, url):
    """
    Scrapes course descriptions for a specific subject from the GWU Bulletin.

    Args:
        subject_code: Subject code (e.g., "CSCI", "DS")
        url: Bulletin URL for this subject

    Returns:
        List of course dictionaries with metadata
    """
    print(f"  Scraping bulletin: {url}...")

    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"  ✗ Error fetching bulletin: {e}")
        return []

    soup = BeautifulSoup(response.content, 'html.parser')

    # Find all course title blocks
    course_titles = soup.find_all('p', class_='courseblocktitle')

    all_courses = []
    print(f"  Found {len(course_titles)} course entries. Parsing...")

    for title_p in course_titles:
        try:
            # Extract full text from the title block (e.g., "CSCI 1010. Orientation. 1 Credit.")
            full_title_text = title_p.get_text(strip=True)

            # Regex to parse: Code. Title. Credits.
            # Now supports multiple subject codes (CSCI, DS, MATH, etc.)
            pattern = rf"^({subject_code}\s*\d+[A-Z]*)\.\s*(.+?)\.\s*(.+?)\.$"
            match = re.match(pattern, full_title_text)

            if match:
                code = match.group(1).replace('\xa0', ' ').strip()
                title = match.group(2).strip()
                credits_text = match.group(3).strip()
            else:
                # Fallback if strict regex fails
                parts = full_title_text.split('.', 2)
                if len(parts) >= 3:
                    code = parts[0].strip().replace('\xa0', ' ')
                    title = parts[1].strip()
                    credits_text = parts[2].strip().rstrip('.')
                else:
                    continue

            # Look for description in the next sibling
            description = "No description available."
            next_elem = title_p.find_next_sibling()

            if next_elem and next_elem.name == 'p' and 'courseblockdesc' in next_elem.get('class', []):
                description = next_elem.get_text(strip=True)

            # Add metadata
            all_courses.append({
                "subject": subject_code,
                "course_code": code,
                "title": title,
                "credits": credits_text,
                "description": description,
                "scraped_date": datetime.now().strftime('%Y-%m-%d'),
                "data_source": "bulletin",
                "source_url": url
            })

        except Exception as e:
            print(f"  ✗ Error parsing course block: {e}")
            continue

    print(f"  ✓ Parsed {len(all_courses)} {subject_code} bulletin courses")
    return all_courses

def scrape_subject_schedule(subject_code, schedule_id, term_id=DEFAULT_TERM_ID, campus_id=DEFAULT_CAMPUS_ID):
    """
    Scrapes course schedule for a specific subject from GWU schedule system.

    Args:
        subject_code: Subject code for internal use (e.g., "CSCI", "DS")
        schedule_id: Schedule system ID for API (e.g., "CSCI", "DATS")
        term_id: Academic term ID (default: 202601 for Spring 2026)
        campus_id: Campus ID (default: 1)

    Returns:
        List of course dictionaries with metadata
    """
    base_url = "https://my.gwu.edu/mod/pws/courses.cfm"
    params = {
        "campId": campus_id,
        "termId": term_id,
        "subjId": schedule_id  # Use schedule_id for API call
    }

    all_courses = []
    page = 1
    max_pages = 10

    print(f"  Scraping schedule for {subject_code} using schedule_id={schedule_id} (term {term_id})...")

    while page <= max_pages:
        params["pageNum"] = page

        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"  ✗ Error fetching page {page}: {e}")
            break

        soup = BeautifulSoup(response.content, 'html.parser')
        tables = soup.find_all('table')

        courses_on_page = 0

        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if not cells:
                    continue

                # Course rows have status (OPEN/CLOSED/etc) in first cell
                if len(cells) >= 10:
                    status = cells[0].get_text(strip=True)
                    if status in ["OPEN", "CLOSED", "WAITLIST", "CANCELLED"]:
                        try:
                            crn = cells[1].get_text(strip=True)
                            subj_text = cells[2].get_text(" ", strip=True).split("Details")[0].strip()
                            section = cells[3].get_text(strip=True)
                            title = cells[4].get_text(strip=True)
                            credit = cells[5].get_text(strip=True)
                            instructor = cells[6].get_text(strip=True)
                            room = cells[7].get_text(" ", strip=True)
                            schedule = cells[8].get_text(" ", strip=True)
                            date_range = cells[9].get_text(strip=True)

                            # Add metadata
                            course_data = {
                                "subject": subject_code,
                                "status": status,
                                "crn": crn,
                                "course_code": subj_text,
                                "section": section,
                                "title": title,
                                "credits": credit,
                                "instructor": instructor,
                                "building_room": room,
                                "day_time": schedule,
                                "date_range": date_range,
                                "scraped_date": datetime.now().strftime('%Y-%m-%d'),
                                "scraped_term": term_id,
                                "data_source": "schedule"
                            }

                            all_courses.append(course_data)
                            courses_on_page += 1
                        except Exception as e:
                            print(f"  ✗ Error parsing row: {e}")
                            continue

        if courses_on_page == 0 and page > 1:
            break

        page += 1
        time.sleep(1)

    print(f"  ✓ Parsed {len(all_courses)} {subject_code} schedule courses")
    return all_courses


def scrape_all_subjects(subjects_to_scrape=None, incremental=False, term_id=DEFAULT_TERM_ID):
    """
    Main function to scrape all subjects or a specific subset.

    Args:
        subjects_to_scrape: List of subject codes to scrape (None = all in SUBJECTS dict)
        incremental: If True, merge with existing data instead of overwriting
        term_id: Academic term ID (default: 202601 for Spring 2026)

    Returns:
        Tuple of (schedule_df, bulletin_df)
    """
    # Determine which subjects to scrape
    if subjects_to_scrape is None:
        subjects_to_scrape = list(SUBJECTS.keys())

    # Validate subject codes
    invalid_subjects = [s for s in subjects_to_scrape if s not in SUBJECTS]
    if invalid_subjects:
        print(f"⚠️  Warning: Unknown subjects {invalid_subjects}. Available: {list(SUBJECTS.keys())}")
        subjects_to_scrape = [s for s in subjects_to_scrape if s in SUBJECTS]

    if not subjects_to_scrape:
        print("❌ No valid subjects to scrape!")
        return None, None

    print("\n" + "="*70)
    print(f"🚀 Starting Multi-Subject Course Scraper")
    print("="*70)
    print(f"Subjects to scrape: {', '.join(subjects_to_scrape)}")
    print(f"Term: {term_id}")
    print(f"Mode: {'Incremental (merge with existing)' if incremental else 'Full (overwrite)'}")
    print("="*70 + "\n")

    all_schedule_data = []
    all_bulletin_data = []

    # Scrape each subject
    for i, subject_code in enumerate(subjects_to_scrape, 1):
        subject_info = SUBJECTS[subject_code]
        print(f"\n[{i}/{len(subjects_to_scrape)}] Processing {subject_code} - {subject_info['full_name']}")
        print("-" * 70)

        # Scrape schedule (use schedule_id for API call)
        schedule_courses = scrape_subject_schedule(
            subject_code=subject_code,
            schedule_id=subject_info['schedule_id'],
            term_id=term_id
        )
        all_schedule_data.extend(schedule_courses)

        # Scrape bulletin
        bulletin_courses = scrape_subject_bulletin(subject_code, subject_info['bulletin_url'])
        all_bulletin_data.extend(bulletin_courses)

        time.sleep(1)  # Be polite to servers

    # Create DataFrames
    schedule_df = pd.DataFrame(all_schedule_data)
    bulletin_df = pd.DataFrame(all_bulletin_data)

    # Handle incremental updates
    if incremental:
        print("\n📊 Merging with existing data...")

        if os.path.exists('data/spring_2026_courses.csv'):
            existing_schedule = pd.read_csv('data/spring_2026_courses.csv')
            # Remove old data for subjects we just scraped
            existing_schedule = existing_schedule[~existing_schedule['subject'].isin(subjects_to_scrape)]
            schedule_df = pd.concat([existing_schedule, schedule_df], ignore_index=True)
            print(f"  ✓ Merged schedule data (kept {len(existing_schedule)} existing courses)")

        if os.path.exists('data/bulletin_courses.csv'):
            existing_bulletin = pd.read_csv('data/bulletin_courses.csv')
            existing_bulletin = existing_bulletin[~existing_bulletin['subject'].isin(subjects_to_scrape)]
            bulletin_df = pd.concat([existing_bulletin, bulletin_df], ignore_index=True)
            print(f"  ✓ Merged bulletin data (kept {len(existing_bulletin)} existing courses)")

    # Save to CSV
    print("\n💾 Saving data...")
    os.makedirs('data', exist_ok=True)

    schedule_df.to_csv('data/spring_2026_courses.csv', index=False)
    print(f"  ✓ Saved schedule: data/spring_2026_courses.csv")

    bulletin_df.to_csv('data/bulletin_courses.csv', index=False)
    print(f"  ✓ Saved bulletin: data/bulletin_courses.csv")

    # Summary statistics
    print("\n" + "="*70)
    print("📈 SCRAPING SUMMARY")
    print("="*70)
    print(f"Total schedule courses: {len(schedule_df)}")
    print(f"Total bulletin courses: {len(bulletin_df)}")
    print("\nCourses by subject:")
    if not schedule_df.empty:
        subject_counts = schedule_df.groupby('subject')['course_code'].nunique()
        for subject, count in subject_counts.items():
            print(f"  • {subject}: {count} unique courses")

    print("\nData freshness:")
    if not schedule_df.empty and 'scraped_date' in schedule_df.columns:
        latest_scrape = schedule_df['scraped_date'].max()
        print(f"  • Last scraped: {latest_scrape}")

    print("="*70 + "\n")
    print("✅ Scraping complete!\n")

    return schedule_df, bulletin_df


if __name__ == "__main__":
    # ========================================================================
    # USAGE EXAMPLES - Uncomment the one you want to use
    # ========================================================================

    # Option 1: Scrape all subjects defined in SUBJECTS (default)
    scrape_all_subjects()

    # Option 2: Scrape only specific subjects
    # scrape_all_subjects(subjects_to_scrape=['CSCI', 'DS'])

    # Option 3: Incremental update - only update CSCI, keep other subjects
    # scrape_all_subjects(subjects_to_scrape=['CSCI'], incremental=True)

    # Option 4: Add a new subject without re-scraping existing ones
    # scrape_all_subjects(subjects_to_scrape=['MATH'], incremental=True)

