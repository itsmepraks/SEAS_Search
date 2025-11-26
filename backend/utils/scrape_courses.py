import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os
import re

def scrape_bulletin_courses():
    """
    Scrapes course descriptions from the GWU Bulletin.
    """
    url = "https://bulletin.gwu.edu/courses/csci/"
    print(f"Starting scrape of GWU Bulletin: {url}...")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching bulletin: {e}")
        return

    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find all course title blocks
    # Based on inspection: <p class="courseblocktitle"><strong>CSCI 1010. ...</strong></p>
    course_titles = soup.find_all('p', class_='courseblocktitle')
    
    all_courses = []
    print(f"Found {len(course_titles)} course entries. Parsing...")

    for title_p in course_titles:
        try:
            # Extract full text from the title block (e.g., "CSCI 1010. Orientation. 1 Credit.")
            full_title_text = title_p.get_text(strip=True)
            
            # Regex to parse: Code. Title. Credits.
            # Handles "CSCI 1010", "CSCI 1010W", spaces, non-breaking spaces, etc.
            # Example: "CSCI 1010. Computer Science Orientation. 1 Credit."
            match = re.match(r"^(CSCI\s*\d+[A-Z]*)\.\s*(.+?)\.\s*(.+?)\.$", full_title_text)
            
            if match:
                code = match.group(1).replace('\xa0', ' ').strip() # Clean non-breaking spaces
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
                    print(f"Skipping malformed title: {full_title_text}")
                    continue

            # Look for description in the next sibling
            # The description is usually in a <p class="courseblockdesc"> immediately following
            description = "No description available."
            next_elem = title_p.find_next_sibling()
            
            if next_elem and next_elem.name == 'p' and 'courseblockdesc' in next_elem.get('class', []):
                description = next_elem.get_text(strip=True)
            
            all_courses.append({
                "course_code": code,
                "title": title,
                "credits": credits_text,
                "description": description,
                "source": "bulletin"
            })
            
        except Exception as e:
            print(f"Error parsing course block: {e}")
            continue

    # Save to CSV
    df = pd.DataFrame(all_courses)
    print(f"Total bulletin courses scraped: {len(df)}")
    
    output_path = "data/bulletin_courses.csv"
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    df.to_csv(output_path, index=False)
    print(f"Bulletin data saved to {output_path}")

def scrape_gwu_courses():
    base_url = "https://my.gwu.edu/mod/pws/courses.cfm"
    params = {
        "campId": 1,
        "termId": 202601,
        "subjId": "CSCI"
    }
    
    all_courses = []
    page = 1
    max_pages = 10 # User mentioned 10 pages
    
    print(f"Starting scrape for {params['subjId']} in term {params['termId']}...")
    
    while page <= max_pages:
        print(f"Scraping page {page}...")
        params["pageNum"] = page
        
        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            break
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # The course listings are in a table. 
        # Based on inspection, we look for rows with class "course-row" or similar?
        # The snapshot showed tables with rows. Let's look for the main table containing course data.
        # A reliable way is to look for rows that contain "OPEN", "CLOSED", "WAITLIST" in the first cell
        # or have the structure.
        
        # Looking at snapshot: 
        # <td class="tableRowContent">OPEN</td>
        # <td class="tableRowContent" align="center">44900</td>
        
        # Let's find all rows (tr)
        tables = soup.find_all('table')
        
        courses_on_page = 0
        
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if not cells:
                    continue
                
                # Check if this is a course row. 
                # Course rows have status (OPEN/CLOSED/etc) in first cell, CRN in second.
                # Let's check length and content.
                if len(cells) >= 10: # We saw about 10 columns in the snapshot header
                    status = cells[0].get_text(strip=True)
                    if status in ["OPEN", "CLOSED", "WAITLIST", "CANCELLED"]:
                        try:
                            crn = cells[1].get_text(strip=True)
                            subject = cells[2].get_text(strip=True) # "CSCI"
                            section = cells[3].get_text(strip=True)
                            course_code = f"{subject} {cells[2].find('a').get_text(strip=True) if cells[2].find('a') else ''}"
                            # Actually subject cell in snapshot was: "CSCI CSCI 1012.10 Details"
                            # Cleaner extraction needed.
                            
                            # Re-inspecting snapshot for cell indices:
                            # 0: STATUS (OPEN)
                            # 1: CRN (44900)
                            # 2: SUBJECT (CSCI <link>1012</link>) -> We want "CSCI 1012"
                            # 3: SECT (10)
                            # 4: COURSE (Title)
                            # 5: CREDIT (3.00)
                            # 6: INSTR. (Goldfrank, J)
                            # 7: BLDG/RM (1957 E 213)
                            # 8: DAY/TIME (M 03:45PM - 05:00PM)
                            # 9: FROM / TO (01/12/26 - 04/27/26)
                            
                            # Let's refine extraction
                            subj_text = cells[2].get_text(" ", strip=True).split("Details")[0].strip()
                            # It might come out as "CSCI CSCI 1012.10" or similar.
                            # Let's just grab the text and clean it later or use the link text if possible.
                            
                            title = cells[4].get_text(strip=True)
                            credit = cells[5].get_text(strip=True)
                            instructor = cells[6].get_text(strip=True)
                            room = cells[7].get_text(" ", strip=True)
                            schedule = cells[8].get_text(" ", strip=True)
                            date_range = cells[9].get_text(strip=True)
                            
                            course_data = {
                                "status": status,
                                "crn": crn,
                                "subject_code": subj_text, 
                                "section": section,
                                "title": title,
                                "credits": credit,
                                "instructor": instructor,
                                "building_room": room,
                                "day_time": schedule,
                                "date_range": date_range
                            }
                            
                            all_courses.append(course_data)
                            courses_on_page += 1
                        except Exception as e:
                            print(f"Error parsing row: {e}")
                            continue

        print(f"Found {courses_on_page} courses on page {page}.")
        
        # Check for "Next Page" link validity or stop if 0 courses found (though header might exist)
        if courses_on_page == 0 and page > 1:
            print("No courses found on this page. Stopping.")
            break
            
        page += 1
        time.sleep(1) # Be polite

    df = pd.DataFrame(all_courses)
    print(f"Total courses scraped: {len(df)}")
    
    # Save to CSV
    output_path = "data/spring_2026_courses.csv"
    df.to_csv(output_path, index=False)
    print(f"Data saved to {output_path}")

if __name__ == "__main__":
    # Scrape the official schedule
    scrape_gwu_courses()
    
    # Scrape the bulletin for descriptions
    scrape_bulletin_courses()

