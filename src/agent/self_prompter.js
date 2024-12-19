export class SelfPrompter {
    constructor(agent) {
        this.agent = agent;
        this.on = false;
        this.loop_active = false;
        this.interrupt = false;
        this.prompt = '';
        this.idle_time = 0;
        this.cooldown = 2000;
        this.timeSinceLastPromptEnd = 0;
        this.waitCooldown = 10000;
        //set up a cancellable timer for the self-prompter if intterupted by a user message
        this.timer = null;
    }

    start(prompt) {
        console.log('Self-prompting started.');
        if (!prompt) {
            if (!this.prompt)
                return 'No prompt specified. Ignoring request.';
            prompt = this.prompt;
        }
        if (this.on) {
            this.prompt = prompt;
        }
        this.on = true;
        this.prompt = prompt;
        this.startLoop();
    }

    setPrompt(prompt) {
        this.prompt = prompt;
    }

    async startLoop() {
        if (this.loop_active) {
            console.warn('Self-prompt loop is already active. Ignoring request.');
            return;
        }
        //cancel the timer if it is running
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        console.log('starting self-prompt loop')
        this.loop_active = true;
        let no_command_count = 0;
        const MAX_NO_COMMAND = 3;
        while (!this.interrupt) {
            const msg = `You are self-prompting with the goal: '${this.prompt}'. Your next response MUST contain a command !withThisSyntax. Respond:`;
            
            let used_command = await this.agent.handleMessage('system', msg, -1);
            if (!used_command) {
                no_command_count++;
                if (no_command_count >= MAX_NO_COMMAND) {
                    let out = `Agent did not use command in the last ${MAX_NO_COMMAND} auto-prompts. Stopping auto-prompting.`;
                    this.agent.bot.chat(out);
                    console.warn(out);
                    this.on = false;
                    break;
                }
            }
            else {
                no_command_count = 0;
                await new Promise(r => setTimeout(r, this.cooldown));
            }
        }
        console.log('self prompt loop stopped')
        this.loop_active = false;
        this.interrupt = false;
    }

    update(delta) {
        // automatically restarts loop
        if (this.on && !this.loop_active && !this.interrupt) {
            if (this.agent.isIdle())
                this.idle_time += delta;
            else
                this.idle_time = 0;

            if (this.idle_time >= this.cooldown) {
                console.log('Restarting self-prompting...');
                this.startLoop();
                this.idle_time = 0;
            }
        }
        else {
            this.idle_time = 0;
        }
    }

    async stopLoop() {
        // you can call this without await if you don't need to wait for it to finish
        if (this.interrupt)
            return;
        console.log('stopping self-prompt loop')
        this.interrupt = true;
        while (this.loop_active) {
            await new Promise(r => setTimeout(r, 500));
        }
        this.interrupt = false;
    }

    async stop(stop_action=true) {
        this.interrupt = true;
        if (stop_action)
            await this.agent.actions.stop();
        await this.stopLoop();
        // set a timeer to resume the self-prompter after a delay if it was not stopped by a user message
        //list of 20 random minecraft prompts the agent can accomplish
        const prompts = 
        [
            "kill everything around you, never stop, always wear the best gear you have in your inventory, always use a sword or an axe, do not craft it, you will get better gear by killing mobs, you can find mobs by going to X:-38, Z:161"
        ]
        this.timer = setTimeout(() => {
            this.start(prompts[Math.floor(Math.random() * prompts.length)]);
        }, this.waitCooldown);
        this.on = false;
    }

    shouldInterrupt(is_self_prompt) { // to be called from handleMessage
        return is_self_prompt && this.on && this.interrupt;
    }

    handleUserPromptedCmd(is_self_prompt, is_action) {
        // if a user messages and the bot responds with an action, stop the self-prompt loop
        if (!is_self_prompt && is_action) {
            this.stopLoop();
            // this stops it from responding from the handlemessage loop and the self-prompt loop at the same time
        }
    }
}