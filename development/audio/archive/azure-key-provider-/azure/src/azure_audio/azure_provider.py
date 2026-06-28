import azure.cognitiveservices.speech as speechsdk
from pathlib import Path
from . import config

def generate_audio_azure(ssml: str, output_path: Path) -> tuple[bool, str]:
    """
    Generates audio using Azure Speech SDK.
    Returns (success, error_message).
    """
    if not config.AZURE_SPEECH_KEY or not config.AZURE_SPEECH_REGION:
        return False, "Missing Azure credentials in .env.azure.local"

    speech_config = speechsdk.SpeechConfig(
        subscription=config.AZURE_SPEECH_KEY,
        region=config.AZURE_SPEECH_REGION,
    )
    speech_config.speech_synthesis_voice_name = config.VOICE
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm
    )

    audio_config = speechsdk.audio.AudioOutputConfig(filename=str(output_path))
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=audio_config
    )

    # We use the synchronous speak_ssml, but the prompt says use speak_ssml_async.
    # It's python, so we can await speak_ssml_async().get() 
    result = synthesizer.speak_ssml_async(ssml).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return True, ""
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        reason = str(cancellation_details.reason)
        error_details = str(cancellation_details.error_details)
        error_code = getattr(cancellation_details, 'error_code', 'Unknown')
        
        # Sanitize error details just in case it leaks key, though Azure usually doesn't put key in error_details
        sanitized_details = error_details.replace(config.AZURE_SPEECH_KEY, "[REDACTED]") if config.AZURE_SPEECH_KEY else error_details
        
        err_msg = f"Canceled: {reason}, ErrorCode: {error_code}, Details: {sanitized_details}"
        return False, err_msg
    else:
        return False, f"Unknown failure reason: {result.reason}"
