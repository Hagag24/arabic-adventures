# NotebookLM Egyptian Audio Reference Guide

This document describes how to manually generate and evaluate an Egyptian-colloquial tone overview using NotebookLM as a quality benchmark comparison.

## Step-by-Step Instructions

1. **Access NotebookLM**: Open [NotebookLM](https://notebooklm.google/) in your browser.
2. **Create Notebook**: Initialize a new notebook for the project "Arabic Adventures".
3. **Upload Spoken Script Reference Source**: Copy-paste the following Arabic sentences into a new text note source:
   ```text
   أهلًا يا بطل! جاهز نبدأ مغامرة جديدة في اللغة العربية؟

   اسمع السؤال بهدوء، وبعد كده اختار الإجابة اللي شايفها صح.

   ممتاز يا بطل، إجابتك صحيحة. كمّل بنفس التركيز.

   ولا يهمك، فكّر شوية وجرّب مرة تانية.
   ```
4. **Configure Custom Style Request**: Under "Generate Audio Overview" or "Customize Speech Output", provide the following exact instruction prompt:
   ```text
   استخدم صوتًا مصريًا طبيعيًا وهادئًا وواضحًا، قريبًا من معلم ابتدائي
   ودود، دون مبالغة أو أداء إذاعي. اجعل مخارج الحروف واضحة، والسرعة
   متوسطة ومريحة للطفل. لا تغيّر الجمل المطلوبة ولا تضف حوارًا جديدًا.
   ```
5. **Download and Store**: Once NotebookLM finishes rendering the audio overview, download the resulting file and place it inside the project directory under:
   ```text
   artifacts/audio/reference/notebooklm/egyptian-reference.wav
   ```

## Usage Constraint
- NotebookLM is for **tone comparison and benchmarking only**.
- Never partition NotebookLM dialogue tracks into individual activity sound bites.
- Never use NotebookLM as a dynamic runtime TTS generator.
