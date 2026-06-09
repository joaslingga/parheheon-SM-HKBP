import json

log_path = r"C:\Users\USER\.gemini\antigravity\brain\386dafad-b1a2-47ff-9f3e-4635a786acb4\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            
            # Check content
            content = data.get("content", "")
            if "export async function restartServerAction" in content:
                print(f"Match in content on step {step_idx} (line {i}):")
                idx = content.find("export async function restartServerAction")
                print(content[idx:idx+2000])
                print("="*80)
                
            # Check tool calls
            for tc in data.get("tool_calls", []):
                args_str = json.dumps(tc.get("args", {}))
                if "export async function restartServerAction" in args_str:
                    print(f"Match in tool call args on step {step_idx} (line {i}):")
                    idx = args_str.find("export async function restartServerAction")
                    print(args_str[idx:idx+2000])
                    print("="*80)
        except Exception as e:
            pass
