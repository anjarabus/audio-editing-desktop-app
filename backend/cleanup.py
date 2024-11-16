import shutil
import os
import sys

def cleanup_temp_directory(temp_dir):
    """Removes the given temporary directory."""
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
        print(f"Temporary directory {temp_dir} removed.")
    else:
        print(f"Temporary directory {temp_dir} does not exist.")

if __name__ == "__main__":
    # Get the temp_dir path from the command-line argument
    if len(sys.argv) > 1:
        temp_dir = sys.argv[1]
        cleanup_temp_directory(temp_dir)
    else:
        print("No temporary directory path provided.")