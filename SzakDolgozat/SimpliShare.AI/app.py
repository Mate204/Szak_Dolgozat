import uvicorn
from fastapi import FastAPI, File, UploadFile
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import io

app = FastAPI()

print("AI Modell loading...")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')

    inputs = processor(image, return_tensors="pt")
    out = model.generate(
        **inputs, 
        max_new_tokens=50, 
        num_beams=5, 
        early_stopping=True
    )
    caption = processor.decode(out[0], skip_special_tokens=True)
    
    words = caption.split()
    stop_words = ["a", "an", "the", "in", "on", "of", "at", "with", "is", "are", "and", "to", "from", "for"]
    
    final_tags = set()
    for word in words:
        clean_word = word.strip().lower()
        if clean_word not in stop_words and len(clean_word) > 2:
            final_tags.add(clean_word)

    # --- OKOS KATEGORIZALAS (Extra tagek a kereseshez) ---
    # Ha varosi elemeket lat
    if any(x in caption for x in ["tower", "statue", "monument", "bridge", "building"]):
        final_tags.update(["architecture", "landmark", "sightseeing", "tourism"])
    
    # Ha termeszetet lat
    if any(x in caption for x in ["tree", "forest", "mountain", "lake", "river", "water"]):
        final_tags.update(["nature", "outdoor", "landscape"])

    # Ha varost/utcát lat
    if any(x in caption for x in ["city", "street", "road", "skyline"]):
        final_tags.update(["urban", "cityscape", "travel"])
    result = list(final_tags)
    print(f"Cimkek: {result}")
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)