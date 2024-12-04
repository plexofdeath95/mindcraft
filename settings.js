export default 
{
    "minecraft_version": "1.20.6", // supports up to 1.21.1
    "host": "127.0.0.1", // or "localhost", "your.ip.address.here"
    "port": 25565,
    "auth": "offline", // or "microsoft"

    // the mindserver manages all agents and hosts the UI
    "host_mindserver": true, // if true, the mindserver will be hosted on this machine. otherwise, specify a public IP address
    "mindserver_host": "localhost",
    "mindserver_port": 8081,
    
    "profiles": [
        "./andy.json",
        // "./profiles/gpt.json",
        // "./profiles/claude.json",
        // "./profiles/gemini.json",
        // "./profiles/llama.json",
        // "./profiles/qwen.json",
        // "./profiles/grok.json",
        
        // using more than 1 profile requires you to /msg each bot indivually
    ],
    "load_memory": false, // load memory from previous session
    "init_message": "Respond with hello world and your name", // sends to all on spawn
    
    "language": "en", // translate to/from this language. Supports these language names: https://cloud.google.com/translate/docs/languages
    "show_bot_views": false, // show bot's view in browser at localhost:3000, 3001...

    "allow_insecure_coding": true, // allows newAction command and model can write/run code on your computer. enable at own risk
    "code_timeout_mins": 10, // minutes code is allowed to run. -1 for no timeout

    "max_messages": 15, // max number of messages to keep in context
    "max_commands": -1, // max number of commands to use in a response. -1 for no limit
    "verbose_commands": false, // show full command syntax
    "narrate_behavior": false, // chat simple automatic actions ('Picking up item!')
    "chat_bot_messages": false, // publicly chat messages to other bots
}

