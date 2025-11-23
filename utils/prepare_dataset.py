import pandas as pd
import json
import os

def create_chat_message(row):
    # Construct a helpful response based on the course data
    # Fields: status, crn, subject_code, section, title, credits, instructor, building_room, day_time, date_range
    
    # Cleaning subject code if it looks like "CSCI CSCI 1012.10"
    raw_code = str(row['subject_code'])
    if "Details" in raw_code:
        raw_code = raw_code.replace("Details", "").strip()
    
    # Attempt to normalize "CSCI CSCI" repetition if present
    parts = raw_code.split()
    if len(parts) >= 2 and parts[0] == parts[1]:
        course_code = " ".join(parts[1:])
    else:
        course_code = raw_code

    title = str(row['title'])
    instructor = str(row['instructor'])
    schedule = str(row['day_time'])
    room = str(row['building_room'])
    crn = str(row['crn'])
    status = str(row['status'])
    
    # System prompt
    system_content = "You are a helpful assistant providing information about GWU Computer Science courses for Spring 2026."
    system_msg = {"role": "system", "content": system_content}
    
    # Variation 1: General Info
    user_msg1 = {"role": "user", "content": f"Tell me about {course_code}."}
    assistant_msg1 = {"role": "assistant", "content": f"The course {course_code}: {title} is taught by {instructor}. It meets on {schedule} in {room}. The status is {status} (CRN: {crn})."}
    
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

def main():
    input_path = "data/spring_2026_courses.csv"
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found. Please run scrape_courses.py first.")
        return

    df = pd.read_csv(input_path)
    output_file = "data/course_finetune.jsonl"
    
    count = 0
    with open(output_file, 'w') as f:
        for _, row in df.iterrows():
            for example in create_chat_message(row):
                f.write(json.dumps(example) + "\n")
                count += 1
                
    print(f"Successfully created dataset at {output_file} with {count} examples.")

if __name__ == "__main__":
    main()

