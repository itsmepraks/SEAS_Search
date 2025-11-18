import pandas as pd
import os
from pathlib import Path

def normalize_columns(df, file_num):
    """
    Normalize column names to a standard format.
    Maps different column name variations to a common schema.
    """
    # Create a mapping dictionary for column normalization
    column_mapping = {}
    
    # Map all possible column name variations to standard names
    for col in df.columns:
        col_lower = col.lower().strip()
        
        # Subject/Course Code mapping
        if col_lower in ['course_code', 'subject']:
            column_mapping[col] = 'subject_code'
        # Course Number mapping (separate column in some files)
        elif col_lower in ['course_number']:
            column_mapping[col] = 'course_number'
        # CRN mapping
        elif col_lower in ['crn']:
            column_mapping[col] = 'crn'
        # Building/Room mapping
        elif col_lower in ['building_room', 'bldg/rm', 'building/room']:
            column_mapping[col] = 'building_room'
        # Comments mapping
        elif col_lower in ['comments', 'comment']:
            column_mapping[col] = 'comments'
        # Credits mapping
        elif col_lower in ['credits', 'credit']:
            column_mapping[col] = 'credits'
        # Dates mapping
        elif col_lower in ['dates', 'from_to', 'from/to']:
            column_mapping[col] = 'dates'
        # Day/Time mapping
        elif col_lower in ['day_time', 'day/time', 'daytime']:
            column_mapping[col] = 'day_time'
        # Instructor mapping
        elif col_lower in ['instructor', 'instr.', 'inst']:
            column_mapping[col] = 'instructor'
        # Section mapping
        elif col_lower in ['section']:
            column_mapping[col] = 'section'
        # Status mapping
        elif col_lower in ['status']:
            column_mapping[col] = 'status'
        # Title mapping
        elif col_lower in ['title', 'course_title', 'course']:
            column_mapping[col] = 'title'
        # Keep other columns as-is but lowercase
        else:
            column_mapping[col] = col.lower().replace(' ', '_').replace('/', '_')
    
    # Rename columns
    df = df.rename(columns=column_mapping)
    
    # Extract subject code - combine if needed
    # If we have both subject_code and course_number, combine them (files 5-6)
    if 'subject_code' in df.columns and 'course_number' in df.columns:
        # Combine: "CSCI" + "6531" = "CSCI 6531"
        df['subject_code'] = df['subject_code'].astype(str).str.strip() + ' ' + df['course_number'].astype(str).str.strip()
    elif 'subject_code' not in df.columns:
        # Try to construct from other columns
        # Check for separate subject and course_number columns
        if 'subject' in df.columns and 'course_number' in df.columns:
            # Combine subject and course_number: "CSCI" + "6531" = "CSCI 6531"
            df['subject_code'] = df['subject'].astype(str).str.strip() + ' ' + df['course_number'].astype(str).str.strip()
        elif 'subject' in df.columns:
            df['subject_code'] = df['subject'].astype(str).str.strip()
        else:
            # If still no subject_code, try to find it in other columns
            print(f"    Warning: Could not find subject/course_code column in file {file_num}")
            print(f"    Available columns: {list(df.columns)}")
    
    return df

def combine_csv_files(data_folder='data', output_file='combined_courses.csv'):
    """
    Combines all CSV files in the data folder into a single CSV file,
    sorted alphabetically by subject code (course_code/subject).
    """
    # Get the path to the data folder
    data_path = Path(data_folder)
    
    # Find all CSV files in the data folder
    csv_files = sorted(list(data_path.glob('*.csv')))
    
    if not csv_files:
        print(f"No CSV files found in {data_folder} folder")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Looking in: {data_path.absolute()}")
        return None
    
    print(f"Found {len(csv_files)} CSV files to combine:")
    for i, file in enumerate(csv_files, 1):
        print(f"  {i}. {file.name}")
    
    # List to store all normalized dataframes
    dataframes = []
    
    # Read each CSV file, normalize, and append to the list
    for i, csv_file in enumerate(csv_files, 1):
        try:
            # Read CSV with proper handling of multiline fields
            df = pd.read_csv(
                csv_file,
                quotechar='"',
                on_bad_lines='skip',
                engine='python'
            )
            
            print(f"\n  File {i}: {csv_file.name}")
            print(f"    Original columns: {list(df.columns)}")
            print(f"    Original rows: {len(df)}")
            
            # Normalize columns
            df = normalize_columns(df, i)
            
            print(f"    Normalized columns: {list(df.columns)}")
            
            # Ensure subject_code exists
            if 'subject_code' not in df.columns:
                print(f"    ⚠ Warning: No subject_code column found after normalization!")
                print(f"    Available columns: {list(df.columns)}")
                continue
            
            # Remove rows where subject_code is NaN
            initial_rows = len(df)
            df = df.dropna(subset=['subject_code'])
            if len(df) < initial_rows:
                print(f"    Removed {initial_rows - len(df)} rows with missing subject_code")
            
            dataframes.append(df)
            print(f"    ✓ Loaded: {len(df)} valid rows")
            
        except Exception as e:
            print(f"  ✗ Error reading {csv_file.name}: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    if not dataframes:
        print("\nNo dataframes were successfully loaded.")
        return None
    
    # Combine all dataframes
    print(f"\n{'='*60}")
    print("Combining dataframes...")
    
    # Find all unique columns across all dataframes
    all_columns = set()
    for df in dataframes:
        all_columns.update(df.columns)
    all_columns = sorted(list(all_columns))
    print(f"Found {len(all_columns)} unique columns across all files")
    
    # Ensure all dataframes have the same columns (fill missing with NaN)
    normalized_dfs = []
    for i, df in enumerate(dataframes, 1):
        # Create a copy to avoid modifying original
        df_copy = df.copy()
        # Add missing columns filled with NaN
        for col in all_columns:
            if col not in df_copy.columns:
                df_copy[col] = None
        # Reorder columns to match all_columns
        df_copy = df_copy[all_columns]
        normalized_dfs.append(df_copy)
    
    # Concatenate all dataframes
    combined_df = pd.concat(normalized_dfs, ignore_index=True)
    print(f"Total rows after combining: {len(combined_df)}")
    print(f"Total columns after combining: {len(combined_df.columns)}")
    
    # Ensure subject_code exists and is not all NaN
    if 'subject_code' not in combined_df.columns:
        print("\n✗ Error: subject_code column not found in combined dataframe!")
        print(f"Available columns: {list(combined_df.columns)}")
        return None
    
    # Remove rows where subject_code is NaN before sorting
    initial_count = len(combined_df)
    combined_df = combined_df.dropna(subset=['subject_code'])
    if len(combined_df) < initial_count:
        print(f"Removed {initial_count - len(combined_df)} rows with missing subject_code before sorting")
    
    # Sort by subject_code (subject name) alphabetically
    combined_df = combined_df.sort_values(by='subject_code', ascending=True, na_position='last')
    
    # Remove any duplicate rows if they exist
    initial_count = len(combined_df)
    combined_df = combined_df.drop_duplicates()
    if len(combined_df) < initial_count:
        print(f"Removed {initial_count - len(combined_df)} duplicate rows")
    
    # Select only the most important columns for output (you can modify this list)
    important_columns = [
        'subject_code', 'crn', 'title', 'credits', 'instructor', 
        'section', 'status', 'building_room', 'day_time', 'dates', 'comments'
    ]
    
    # Only include columns that exist
    output_columns = [col for col in important_columns if col in combined_df.columns]
    output_columns.extend([col for col in combined_df.columns if col not in output_columns])
    
    # Save to output CSV file
    output_path = Path(output_file)
    try:
        combined_df[output_columns].to_csv(output_path, index=False, quoting=1)
        print(f"\n✓ Successfully created {output_path.absolute()}")
        print(f"  Total rows: {len(combined_df)}")
        print(f"  Total columns: {len(output_columns)}")
        print(f"  Sorted by: subject_code (alphabetically)")
        print(f"\nFirst few subject codes:")
        for code in combined_df['subject_code'].head(10).unique():
            print(f"  - {code}")
        print(f"\nLast few subject codes:")
        for code in combined_df['subject_code'].tail(10).unique():
            print(f"  - {code}")
    except Exception as e:
        print(f"\n✗ Error saving file: {e}")
        import traceback
        traceback.print_exc()
        return None
    
    return combined_df

if __name__ == "__main__":
    # Run the combination
    print("Starting CSV combination process...")
    print(f"Working directory: {os.getcwd()}\n")
    
    result = combine_csv_files()
    
    if result is not None:
        print("\n✓ Process completed successfully!")
    else:
        print("\n✗ Process failed. Please check the error messages above.")