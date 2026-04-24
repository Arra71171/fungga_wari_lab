import os
import glob
import re

def refactor_tests():
    test_dir = r"c:\Wari\fungga-wari-lab\apps\web\testsprite_tests"
    test_files = glob.glob(os.path.join(test_dir, "TC*.py"))

    for file_path in test_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Fix the un-awaited expect
        content = re.sub(
            r'expect\(page\)\.not_to_have_url\("about:blank"\)',
            r'await expect(page).not_to_have_url("about:blank")',
            content
        )

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

if __name__ == "__main__":
    refactor_tests()
