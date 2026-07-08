import re
text = "rounded-full rounded-sm rounded-lg rounded-tl-xl rounded-[20px]"
new_text = re.sub(r'\brounded-(?!none\b)(?:(?:t|r|b|l|tl|tr|bl|br)-)?(?:sm|md|lg|xl|2xl|3xl|full|\[.*?\])\b', 'rounded-none', text)
print(new_text)
