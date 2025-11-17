#!/usr/bin/env python3
"""
Llama-3 Fine-Tuning Script for Legalify
Fine-tunes Llama-3-8B model using LoRA for Indian legal domain

⚠️  REQUIREMENTS:
- GPU with at least 16GB VRAM (RTX 4090, A100, etc.)
- CUDA 11.8+ installed
- Training data in data/training_data.json

📦 INSTALL DEPENDENCIES:
pip install transformers peft bitsandbytes trl datasets accelerate
"""

import os
import json
import torch
from pathlib import Path
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    TrainingArguments
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer
from datasets import Dataset

def load_training_data(data_path):
    """Load and format training data from JSON file"""
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert to HuggingFace dataset format
        formatted_data = []
        for item in data:
            # Expected format: {"instruction": "...", "input": "...", "output": "..."}
            text = f"### Instruction:\n{item['instruction']}\n\n"
            if item.get('input'):
                text += f"### Input:\n{item['input']}\n\n"
            text += f"### Response:\n{item['output']}"
            
            formatted_data.append({"text": text})
        
        return Dataset.from_list(formatted_data)
    
    except FileNotFoundError:
        print(f"❌ Training data file not found: {data_path}")
        print("Create data/training_data.json with format:")
        print('[{"instruction": "Draft a rental agreement", "input": "", "output": "RENTAL AGREEMENT..."}]')
        return None

def setup_model_and_tokenizer(model_name):
    """Setup model with 4-bit quantization and tokenizer"""
    
    # 4-bit quantization config for memory efficiency
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16
    )
    
    # Load model with quantization
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    
    return model, tokenizer

def setup_lora_config():
    """Configure LoRA parameters for efficient fine-tuning"""
    return LoraConfig(
        r=16,                    # Rank of adaptation
        lora_alpha=16,           # LoRA scaling parameter
        target_modules=[         # Target attention modules
            "q_proj",
            "k_proj", 
            "v_proj",
            "o_proj"
        ],
        lora_dropout=0.1,        # LoRA dropout
        bias="none",             # Bias type
        task_type="CAUSAL_LM"    # Task type
    )

def train_model():
    """Main training function"""
    
    # Check GPU availability
    if not torch.cuda.is_available():
        print("❌ CUDA not available. This script requires a GPU.")
        return
    
    print(f"🚀 Using GPU: {torch.cuda.get_device_name()}")
    print(f"💾 GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    
    # Setup paths
    base_dir = Path(__file__).parent.parent
    data_path = base_dir / "data" / "training_data.json"
    output_dir = base_dir / "models" / "legalify-llama-adapter"
    
    # Load training data
    print("📚 Loading training data...")
    dataset = load_training_data(data_path)
    if dataset is None:
        return
    
    print(f"✅ Loaded {len(dataset)} training examples")
    
    # Model configuration
    model_name = "unsloth/llama-3-8b-bnb-4bit"  # Pre-quantized model
    
    print(f"🤖 Loading model: {model_name}")
    model, tokenizer = setup_model_and_tokenizer(model_name)
    
    # Prepare model for training
    model = prepare_model_for_kbit_training(model)
    
    # Setup LoRA
    lora_config = setup_lora_config()
    model = get_peft_model(model, lora_config)
    
    print("🔧 Model prepared for LoRA fine-tuning")
    model.print_trainable_parameters()
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=str(output_dir),
        num_train_epochs=1,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=10,
        max_steps=60,                    # Quick training for demo
        learning_rate=2e-4,
        fp16=True,
        logging_steps=10,
        save_strategy="steps",
        save_steps=30,
        optim="paged_adamw_8bit",       # Memory efficient optimizer
        remove_unused_columns=False,
    )
    
    # Setup trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        tokenizer=tokenizer,
        args=training_args,
        dataset_text_field="text",
        max_seq_length=512,
        packing=False,
    )
    
    print("🎯 Starting training...")
    
    # Train the model
    trainer.train()
    
    # Save the fine-tuned adapter
    print(f"💾 Saving model to {output_dir}")
    trainer.save_model()
    tokenizer.save_pretrained(output_dir)
    
    print("✅ Training completed!")
    print(f"📁 Model saved to: {output_dir}")
    print("\n🔥 Next steps:")
    print("1. Test the model with inference script")
    print("2. Deploy to production")
    print("3. Collect user feedback for next iteration")

if __name__ == "__main__":
    print("🚀 Legalify Llama-3 Fine-Tuning")
    print("=" * 50)
    
    # Check if running in appropriate environment
    if not torch.cuda.is_available():
        print("⚠️  WARNING: No GPU detected!")
        print("This script requires a CUDA-capable GPU with 16GB+ VRAM")
        print("Consider using Google Colab Pro or AWS/Azure GPU instances")
        exit(1)
    
    train_model()