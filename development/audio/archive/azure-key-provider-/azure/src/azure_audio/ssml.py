import xml.sax.saxutils as saxutils
from . import config

def generate_ssml(arabic_text: str) -> str:
    # Escape XML special characters
    escaped_text = saxutils.escape(arabic_text)
    
    # Deterministic SSML
    return f"""<speak version="1.0" xml:lang="{config.LOCALE}">
  <voice name="{config.VOICE}">
    <prosody rate="{config.RATE}" pitch="{config.PITCH}" volume="{config.VOLUME}">
      {escaped_text}
    </prosody>
  </voice>
</speak>"""
