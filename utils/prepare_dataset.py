import json
import os
from pathlib import Path

import pandas as pd

# Get project root directory (parent of utils/)
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent

def get_data_path(filename):
    """Get path to a file in the data/ directory, relative to project root."""
    return PROJECT_ROOT / "data" / filename

def load_descriptions():
    """Loads course descriptions from bulletin_courses.csv if available."""
    path = get_data_path("bulletin_courses.csv")
    descriptions = {}
    subject_info = {}

    if os.path.exists(path):
        try:
            df = pd.read_csv(path)
            # Normalize course code to match spring_2026 format (e.g. "CSCI 1010")
            for _, row in df.iterrows():
                code = str(row['course_code']).strip()
                desc = str(row['description']).strip()
                descriptions[code] = desc

                # Track subject info for better prompts
                if 'subject' in row:
                    subject = str(row['subject']).strip()
                    subject_info[subject] = subject_info.get(subject, 0) + 1

            print(f"Loaded {len(descriptions)} descriptions from bulletin.")
            if subject_info:
                print(f"Subjects found: {dict(subject_info)}")
        except Exception as e:
            print(f"Error loading descriptions: {e}")
    return descriptions, subject_info

def create_chat_message(row, descriptions, subjects_list):
    # Construct a helpful response based on the course data
    # Fields: subject, status, crn, course_code, section, title, credits, instructor, building_room, day_time, date_range

    # Get course code (now directly from the new format)
    course_code = str(row.get('course_code', row.get('subject_code', ''))).strip()

    # Fallback: Clean if it looks like "CSCI CSCI 1012.10" (old format)
    if "Details" in course_code:
        course_code = course_code.replace("Details", "").strip()

    # Attempt to normalize "CSCI CSCI" repetition if present
    parts = course_code.split()
    if len(parts) >= 2 and parts[0] == parts[1]:
        course_code = " ".join(parts[1:])

    title = str(row['title'])
    instructor = str(row['instructor'])
    schedule = str(row['day_time'])
    room = str(row['building_room'])
    crn = str(row['crn'])
    status = str(row['status'])

    # Get description if available
    description = descriptions.get(course_code, "")

    # Dynamic system prompt based on available subjects
    if len(subjects_list) > 1:
        subject_names = " and ".join(subjects_list)
        system_content = f"You are a helpful assistant providing information about GWU {subject_names} courses for Spring 2026."
    else:
        system_content = f"You are a helpful assistant providing information about GWU {subjects_list[0]} courses for Spring 2026."

    system_msg = {"role": "system", "content": system_content}
    
    # Variation 1: General Info
    user_msg1 = {"role": "user", "content": f"Tell me about {course_code}."}
    
    content1 = f"The course {course_code}: {title} is taught by {instructor}. It meets on {schedule} in {room}. The status is {status} (CRN: {crn})."
    if description and description != "nan":
        content1 += f"\n\nDescription: {description}"
        
    assistant_msg1 = {"role": "assistant", "content": content1}
    
    yield {"messages": [system_msg, user_msg1, assistant_msg1]}
    
    # Variation 2: Instructor
    user_msg2 = {"role": "user", "content": f"Who teaches {title}?"}
    assistant_msg2 = {"role": "assistant", "content": f"{title} ({course_code}) is taught by {instructor}."}
    
    yield {"messages": [system_msg, user_msg2, assistant_msg2]}

    # Variation 3: Schedule
    user_msg3 = {"role": "user", "content": f"When is {course_code} offered?"}
    assistant_msg3 = {"role": "assistant", "content": f"{course_code} is scheduled for {schedule} in {room}."}
    
    yield {"messages": [system_msg, user_msg3, assistant_msg3]}
    
    # Variation 4: Course Code Lookup
    user_msg4 = {"role": "user", "content": f"What is the schedule for CRN {crn}?"}
    assistant_msg4 = {"role": "assistant", "content": f"CRN {crn} corresponds to {course_code}: {title}. It meets on {schedule}."}
    
    yield {"messages": [system_msg, user_msg4, assistant_msg4]}
    
    # Variation 5: Description specific (if available)
    if description and description != "nan":
        user_msg5 = {"role": "user", "content": f"What is covered in {course_code}?"}
        assistant_msg5 = {"role": "assistant", "content": f"{course_code}: {title}. {description}"}
        yield {"messages": [system_msg, user_msg5, assistant_msg5]}

def main():
    input_path = get_data_path("spring_2026_courses.csv")
    if not input_path.exists():
        print(f"Error: {input_path} not found. Please run scrape_courses.py first.")
        return

    print("\n" + "="*70)
    print("📚 Preparing Fine-tuning Dataset")
    print("="*70)

    # Load schedule data
    df = pd.read_csv(input_path)
    print(f"Loaded {len(df)} course entries from schedule.")

    # Load descriptions and subject info
    descriptions, subject_info = load_descriptions()

    # Get unique subjects from schedule data
    if 'subject' in df.columns:
        subjects_in_data = sorted(df['subject'].unique())
        print(f"Subjects in dataset: {subjects_in_data}")
    else:
        subjects_in_data = ["Computer Science"]  # Fallback for old format

    # Map subject codes to full names
    subject_mapping = {
        "CSCI": "Computer Science",
        "DATS": "Data Science",  # Official GWU code
        "DS": "Data Science",    # Alias (for backward compatibility)
        "MATH": "Mathematics",
        "STAT": "Statistics",
    }
    subjects_list = [subject_mapping.get(s, s) for s in subjects_in_data]

    output_file = get_data_path("course_finetune.jsonl")

    count = 0
    subject_counts = {}

    with open(output_file, 'w') as f:
        for _, row in df.iterrows():
            subject = row.get('subject', 'CSCI')
            subject_counts[subject] = subject_counts.get(subject, 0) + 1

            for example in create_chat_message(row, descriptions, subjects_list):
                f.write(json.dumps(example) + "\n")
                count += 1

    print("\n" + "="*70)
    print("📊 DATASET SUMMARY")
    print("="*70)
    print(f"Total training examples: {count}")
    print(f"Examples per subject:")
    for subject, cnt in sorted(subject_counts.items()):
        examples_per_course = count // len(df) if len(df) > 0 else 0
        print(f"  • {subject}: {cnt} courses × ~{examples_per_course} variations = ~{cnt * examples_per_course} examples")
    print(f"\nSaved to: {output_file}")
    
    # Sync to public/data/ for frontend access
    print("\n📦 Syncing to public/data/ for frontend...")
    try:
        import shutil
        public_data_dir = PROJECT_ROOT / 'public' / 'data'
        public_data_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(output_file, public_data_dir / 'course_finetune.jsonl')
        print(f"✓ Synced to: {public_data_dir / 'course_finetune.jsonl'}")
    except Exception as e:
        print(f"⚠ Warning: Could not sync to public/data/: {e}")
        print("  You can manually run: python utils/sync_data_to_public.py")
    
    print("="*70 + "\n")
    print("✅ Dataset preparation complete!")

if __name__ == "__main__":
    main()

