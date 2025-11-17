#!/usr/bin/env python3
"""
Fine-tune Llama/Gemma model for legal document generation
Requires: transformers, peft, bitsandbytes, accelerate
"""
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset
import os

# Configuration
MODEL_NAME = "meta-llama/Llama-2-7b-hf"  # or "google/gemma-7b"
OUTPUT_DIR = "models/legalify-llama-7b"
TRAINING_DATA = "data/sft_llama_format.jsonl"

def load_model_and_tokenizer():
    """Load base model with 4-bit quantization"""
    print(f"Loading {MODEL_NAME}...")
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.pad_token = tokenizer.eos_token
    
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        load_in_4bit=True,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    
    return model, tokenizer

def setup_lora(model):
    """Setup LoRA for efficient fine-tuning"""
    print("Setting up LoRA...")
    
    lora_config = LoraConfig(
        r=16,  # LoRA rank
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    
    model = prepare_model_for_kbit_training(model)
    model = get_peft_model(model, lora_config)
    
    return model

def prepare_dataset(tokenizer):
    """Load and prepare training dataset"""
    print("Loading training data...")
    
    dataset = load_dataset('json', data_files=TRAINING_DATA)
    
    def tokenize_function(examples):
        return tokenizer(
            examples['text'],
            truncation=True,
            max_length=2048,
            padding='max_length'
        )
    
    tokenized_dataset = dataset.map(tokenize_function, batched=True)
    return tokenized_dataset

def train_model(model, tokenizer, dataset):
    """Train the model"""
    print("Starting training...")
    
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        fp16=True,
        logging_steps=10,
        save_steps=100,
        save_total_limit=3,
        warmup_steps=50,
        optim="paged_adamw_8bit",
    )
    
    from transformers import Trainer
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset['train'],
        tokenizer=tokenizer,
    )
    
    trainer.train()
    
    # Save final model
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"Model saved to {OUTPUT_DIR}")

def main():
    print("=" * 50)
    print("LEGALIFY MODEL FINE-TUNING")
    print("=" * 50)
    
    # Check if training data exists
    if not os.path.exists(TRAINING_DATA):
        print(f"Error: Training data not found at {TRAINING_DATA}")
        print("Run: python scripts/prepare_sft_data.py first")
        return
    
    # Load model
    model, tokenizer = load_model_and_tokenizer()
    
    # Setup LoRA
    model = setup_lora(model)
    
    # Prepare dataset
    dataset = prepare_dataset(tokenizer)
    
    # Train
    train_model(model, tokenizer, dataset)
    
    print("\n" + "=" * 50)
    print("TRAINING COMPLETE!")
    print("=" * 50)
    print(f"\nModel saved to: {OUTPUT_DIR}")
    print("\nNext steps:")
    print("1. Test the model: python scripts/test_model.py")
    print("2. Deploy to HuggingFace: huggingface-cli upload")
    print("3. Update .env with new model name")

if __name__ == "__main__":
    # Check dependencies
    try:
        import transformers
        import peft
        import bitsandbytes
        import accelerate
    except ImportError as e:
        print("Missing dependencies! Install with:")
        print("pip install transformers peft bitsandbytes accelerate datasets")
        exit(1)
    
    main()
