import os
import sys
from collections import defaultdict

# 临时重定向stdout来隐藏pygame的初始化信息
# import io
# original_stdout = sys.stdout
# sys.stdout = io.StringIO()

# import pygame

# 恢复stdout
# sys.stdout = original_stdout


# 贴纸标签的五个分类
# ['sunny:27', 'rainy:26', 'cloudy:27', 'snowy:28']
# ['spring:25', 'summer:22', 'autumn:32', 'winter:29']
# ['forest:25', 'beach:25', 'desert:28', 'mountain:30']
# ['pink:28', 'blue:27', 'yellow:28', 'green:25']
# ['cat:27', 'fish:27', 'elephant:27', 'butterfly:27']

categories = [
  ["sunny", "rainy", "cloudy", "snowy"],
  ["spring", "summer", "autumn", "winter"],
  ["forest", "beach", "desert", "mountain"],
  ["pink", "blue", "yellow", "green"],
  ["cat", "fish", "elephant", "butterfly"]
]

# 20个贴纸的数据定义（示例，需要根据实际情况手动填入）
# ['sunny:1.00', 'rainy:1.00', 'cloudy:1.00', 'snowy:1.00']
# ['spring:1.30', 'summer:1.30', 'autumn:1.30', 'winter:1.30']
# ['forest:0.50', 'beach:0.50', 'desert:0.50', 'mountain:0.50']
# ['pink:2.30', 'blue:2.30', 'yellow:2.30', 'green:2.30']
# ['cat:0.50', 'fish:0.50', 'elephant:0.50', 'butterfly:0.50']

logos = {
  "logo1": {"sunny": 0.1, "summer": 0.1, "beach": 0.1, "pink": 0.1, "elephant": 0.1},
  "logo2": {"cloudy": 0.1, "autumn": 0.1, "desert": 0.1, "pink": 0.1, "butterfly": 0.1},
  "logo3": {"rainy": 0.1, "spring": 0.1, "forest": 0.1, "pink": 0.1, "cat": 0.1},
  "logo4": {"snowy": 0.1, "winter": 0.1, "mountain": 0.1, "pink": 0.1, "fish": 0.1},
  "logo5": {"cloudy": 0.1, "summer": 0.1, "beach": 0.1, "pink": 0.1, "butterfly": 0.1},
  "logo6": {"sunny": 0.1, "autumn": 0.1, "forest": 0.1, "pink": 0.1, "elephant": 0.1},
  
  "kb1": {"rainy": 0.5, "winter": 0.5, "desert": 0.1, "blue": 0.5, "cat": 0.1},
  "kbr1": {"cloudy": 0.3, "winter": 0.5, "mountain": 0.1, "blue": 0.5, "fish": 0.1},
  "kb2": {"sunny": 0.1, "spring": 0.5, "beach": 0.1, "pink": 0.6, "butterfly": 0.1},
  "kbr2": {"cloudy": 0.3, "spring": 0.5, "forest": 0.1, "pink": 0.6, "elephant": 0.1},
  "kb3": {"sunny": 0.1, "summer": 0.5, "desert": 0.1, "yellow": 0.6, "cat": 0.1},
  "kbr3": {"snowy": 0.5, "summer": 0.5, "mountain": 0.1, "blue": 0.5, "fish": 0.1},
  "kb4": {"sunny": 0.2, "autumn": 0.5, "beach": 0.1, "yellow": 0.6, "butterfly": 0.1},
  "kbr4": {"sunny": 0.3, "autumn": 0.5, "forest": 0.1, "yellow": 0.6, "elephant": 0.1},
  
  "b1": {"snowy": 0.1, "spring": 0.1, "desert": 0.1, "pink": 0.5, "cat": 0.1},
  "b2": {"rainy": 0.3, "winter": 0.1, "mountain": 0.1, "blue": 0.4, "fish": 0.1},
  "b3": {"sunny": 0.1, "summer": 0.1, "beach": 0.1, "yellow": 0.5, "butterfly": 0.1},
  "b4": {"snowy": 0.3, "autumn": 0.1, "forest": 0.1, "blue": 0.4, "elephant": 0.1},
  "b5": {"rainy": 0.1, "spring": 0.1, "desert": 0.1, "green": 1.2, "cat": 0.1},
  "b6": {"cloudy": 0.2, "winter": 0.1, "mountain": 0.1, "green": 1.1, "fish": 0.1}
}

def build_input_tags(selected_logos):
  """
  根据选中的贴纸计算input_tags
  
  Args:
    selected_logos: list of logo names
  
  Returns:
    input_tags: list of 5 tags [weather, season, scene, color, animal]
  """
  # 为每一类统计每个标签的累积分值
  accum = [defaultdict(float) for _ in range(5)]
    
  for logo in selected_logos:
    data = logos.get(logo)
    if not data:
      print(f"Warning: 没有找到贴纸 '{logo}' 的数据，跳过")
      continue
    
    for i in range(5):
      for tag in categories[i]:
        accum[i][tag] += float(data.get(tag, 0))
    
  # 取每类分值最大的标签
  input_tags = []
  for i in range(5):
    bucket = accum[i]
    if not bucket:
      input_tags.append(categories[i][0])  # 默认取第一个
      continue
    
    # 找到值最大的标签
    max_tag = max(bucket.keys(), key=lambda tag: bucket[tag])
    input_tags.append(max_tag)
  
  return input_tags

def find_best_match(input_tags, folder_path):
  """
  Find the best matching MIDI file based on tag matching scores.
  
  Args:
    input_tags: List of 5 tags [weather, season, scene, color, animal]
    folder_path: Path to folder containing MIDI files
  
  Returns:
    Best matching filename
  """
  # Score weights for each category
  weights = [4, 5, 3, 3, 2]  # weather, season, scene, color, animal
  
  best_score = -1
  best_matches = []
  
  # Get all .mid files in folder
  midi_files = [f for f in os.listdir(folder_path) if f.endswith('.mid')]
  
  for filename in midi_files:
    # Extract tags from filename (remove .mid extension)
    file_tags = filename[:-4].split(',')
    
    if len(file_tags) != 5:
      continue
      
    # Calculate score
    score = 0
    matches = 0
    
    for i in range(5):
      if input_tags[i] == file_tags[i]:
        score += weights[i]
        matches += 1
    
    # Update best matches
    if score > best_score:
      best_score = score
      best_matches = [(filename, matches)]
    elif score == best_score:
      best_matches.append((filename, matches))
  
  if not best_matches:
    return None
  
  # If multiple files have same score, choose by most matches
  max_matches = max(match[1] for match in best_matches)
  top_matches = [match[0] for match in best_matches if match[1] == max_matches]
  
  # If still tied, choose lexicographically smallest
  return min(top_matches)

def play_midi(filename, folder_path):
  """Play MIDI file using pygame"""
  try:
    # pygame.mixer.init()
    # filepath = os.path.join(folder_path, filename)
    # pygame.mixer.music.load(filepath)
    # pygame.mixer.music.play()
    print(f"Playing: {filename}")
    
    # Keep playing until finished
    # while pygame.mixer.music.get_busy():
    #   pygame.time.wait(100)
      
  except Exception as e:
    print(f"Error playing {filename}: {e}")

def main():
  import sys
  
  if len(sys.argv) < 3:
    print("Usage: python match.py <selected_stickers> <midi_folder>")
    print("Example: python match.py logo1,kb2,b6 /path/to/midi/files")
    return
  
  # 解析命令行参数
  selected_stickers_str = sys.argv[1]
  folder_path = sys.argv[2]
  
  # 分割贴纸列表
  selected_logos = [s.strip() for s in selected_stickers_str.split(',') if s.strip()]
  
  print(f"Selected logos: {selected_logos}")

  # 根据贴纸构建input_tags
  input_tags = build_input_tags(selected_logos)
  print(f"Generated input_tags: {input_tags}")
  
  # 查找最佳匹配
  best_file = find_best_match(input_tags, folder_path)
  
  if best_file:
    print(f"Best match: {best_file}")
    # 输出匹配的文件名，供 Node.js 脚本读取
    print(best_file)
  else:
    print("No matching file found")
    print("None")

if __name__ == "__main__":
  main()