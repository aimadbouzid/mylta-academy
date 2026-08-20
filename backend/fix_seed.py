import re

file_path = '/Users/aimadbouzidi/Downloads/7sab /myAcademy/backend/prisma/seed.js'
with open(file_path, 'r') as f:
    content = f.read()

new_content = re.sub(
    r'https://storage\.googleapis\.com/gtv-videos-bucket/sample/BigBuckBunny\.mp4',
    r'https://www.youtube.com/watch?v=bMknfKXIFA8',
    content
)

# Also replace DEMO_ID in case some were missed or it's a fresh seed file
new_content = re.sub(
    r'https://drive\.google\.com/file/d/DEMO_ID_\d+/view',
    r'https://www.youtube.com/watch?v=bMknfKXIFA8',
    new_content
)


with open(file_path, 'w') as f:
    f.write(new_content)

print("Replaced all video URLs with YouTube URLs")
