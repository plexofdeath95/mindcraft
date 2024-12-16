import { spawn } from 'child_process';

export class AgentProcess {
    static runningCount = 0;

    start(profile, load_memory=false, init_message=null, count_id=0) {
        let args = ['src/process/init-agent.js', this.name];
        args.push('-p', profile);
        args.push('-c', count_id);
        if (load_memory)
            args.push('-l', load_memory);
        if (init_message)
            args.push('-m', init_message);

        const agentProcess = spawn('node', args, {
            stdio: 'inherit',
            stderr: 'inherit',
        });
        AgentProcess.runningCount++;
        
        let restartAttempts = {}; // To track restart attempts per profile

        agentProcess.on('exit', (code, signal) => {
            console.log(`Agent process exited with code ${code} and signal ${signal}`);
        
            if (!restartAttempts[profile]) {
                restartAttempts[profile] = 0; // Initialize restart attempts for this profile
            }
        
            const tryRestart = () => {
                if (restartAttempts[profile] >= 5) {
                    console.error(`Agent process ${profile} has failed to restart 5 times. Giving up.`);
                    AgentProcess.runningCount--;
                    if (AgentProcess.runningCount <= 0) {
                        console.error('All agent processes have ended. Exiting.');
                        process.exit(0);
                    }
                    return;
                }
        
                restartAttempts[profile]++;
                console.log(`Restart attempt ${restartAttempts[profile]} for agent process ${profile}`);
        
                this.start(profile, true, 'Agent process restarted.', count_id);
        
                // Check if the process exited quickly, and retry after a delay
                setTimeout(() => {
                    if (restartAttempts[profile] < 5) {
                        tryRestart();
                    }
                }, 10000); // Retry after 10 seconds
            };
        
            if (code !== 0) {
                console.log('Restarting agent with timeout...');
                tryRestart();
            }
        });
        
        agentProcess.on('error', (err) => {
            console.error('Agent process error:', err);
        });
    }
}