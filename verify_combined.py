import pandas as pd
from pathlib import Path

def verify_combined_data():
    """Verify that combined_courses.csv contains all data from source files"""
    
    data_folder = Path('data')
    csv_files = sorted(list(data_folder.glob('*.csv')))
    combined_file = Path('combined_courses.csv')
    
    print("="*70)
    print("VERIFICATION REPORT: Combined CSV vs Source Files")
    print("="*70)
    
    # Read source files and count rows
    source_data = {}
    total_source_rows = 0
    
    print("\n📁 SOURCE FILES:")
    for i, csv_file in enumerate(csv_files, 1):
        try:
            df = pd.read_csv(csv_file, engine='python', on_bad_lines='skip')
            row_count = len(df)
            source_data[csv_file.name] = row_count
            total_source_rows += row_count
            print(f"  {i}. {csv_file.name:60s} → {row_count:4d} rows")
        except Exception as e:
            print(f"  {i}. {csv_file.name:60s} → ERROR: {e}")
            source_data[csv_file.name] = 0
    
    print(f"\n  Total source rows: {total_source_rows}")
    
    # Read combined file
    print("\n📄 COMBINED FILE:")
    try:
        combined_df = pd.read_csv(combined_file, engine='python', on_bad_lines='skip')
        combined_rows = len(combined_df)
        print(f"  combined_courses.csv: {combined_rows} rows")
        
        # Check if subject_code column exists
        if 'subject_code' in combined_df.columns:
            unique_subjects = combined_df['subject_code'].nunique()
            print(f"  Unique subject codes: {unique_subjects}")
            
            # Show first and last few subject codes
            print(f"\n  First 5 subject codes:")
            for code in combined_df['subject_code'].head(5).unique():
                print(f"    - {code}")
            print(f"\n  Last 5 subject codes:")
            for code in combined_df['subject_code'].tail(5).unique():
                print(f"    - {code}")
        else:
            print("  ⚠ Warning: 'subject_code' column not found!")
            print(f"  Available columns: {list(combined_df.columns)}")
    except Exception as e:
        print(f"  ERROR reading combined file: {e}")
        return
    
    # Compare row counts
    print("\n" + "="*70)
    print("COMPARISON:")
    print("="*70)
    
    if combined_rows == total_source_rows:
        print(f"✅ Row count matches! ({combined_rows} rows)")
    elif combined_rows < total_source_rows:
        missing = total_source_rows - combined_rows
        print(f"⚠️  Row count mismatch!")
        print(f"   Source files total: {total_source_rows} rows")
        print(f"   Combined file:      {combined_rows} rows")
        print(f"   Missing:           {missing} rows")
    else:
        extra = combined_rows - total_source_rows
        print(f"⚠️  Combined file has MORE rows than source files!")
        print(f"   Source files total: {total_source_rows} rows")
        print(f"   Combined file:      {combined_rows} rows")
        print(f"   Extra:              {extra} rows (might be duplicates)")
    
    # Check for sorting
    print("\n" + "="*70)
    print("SORTING VERIFICATION:")
    print("="*70)
    
    if 'subject_code' in combined_df.columns:
        # Check if sorted alphabetically
        sorted_subjects = combined_df['subject_code'].sort_values().reset_index(drop=True)
        actual_subjects = combined_df['subject_code'].reset_index(drop=True)
        
        if sorted_subjects.equals(actual_subjects):
            print("✅ File is correctly sorted alphabetically by subject_code")
        else:
            print("⚠️  File is NOT sorted alphabetically by subject_code")
            print("   First few mismatches:")
            for i in range(min(5, len(sorted_subjects))):
                if sorted_subjects.iloc[i] != actual_subjects.iloc[i]:
                    print(f"     Position {i}: Expected '{sorted_subjects.iloc[i]}', Got '{actual_subjects.iloc[i]}'")
    
    # Check for duplicates
    print("\n" + "="*70)
    print("DUPLICATE CHECK:")
    print("="*70)
    
    if 'subject_code' in combined_df.columns and 'crn' in combined_df.columns:
        # Check for duplicate CRNs (should be unique per course offering)
        duplicate_crns = combined_df[combined_df.duplicated(subset=['crn'], keep=False)]
        if len(duplicate_crns) > 0:
            print(f"⚠️  Found {len(duplicate_crns)} rows with duplicate CRNs")
            print(f"   (This might be expected if same course has multiple sections)")
        else:
            print("✅ No duplicate CRNs found")
    
    # Sample data check
    print("\n" + "="*70)
    print("SAMPLE DATA CHECK:")
    print("="*70)
    
    # Check a few specific courses from each source file
    sample_checks = [
        ("CSCI 1012", "Should be from file 1"),
        ("CSCI 3908", "Should be from files 1-2"),
        ("CSCI 4366", "Should be from file 3"),
        ("CSCI 6531", "Should be from file 5"),
        ("CSCI 6908", "Should be from file 6"),
    ]
    
    for subject_code, note in sample_checks:
        matches = combined_df[combined_df['subject_code'] == subject_code]
        if len(matches) > 0:
            print(f"✅ Found {len(matches)} row(s) for {subject_code} - {note}")
        else:
            print(f"⚠️  NOT FOUND: {subject_code} - {note}")
    
    print("\n" + "="*70)
    print("VERIFICATION COMPLETE")
    print("="*70)

if __name__ == "__main__":
    verify_combined_data()

