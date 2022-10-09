import { BaseTask } from 'adonis5-scheduler/build'
import ProcessesController from 'App/Controllers/Http/ProcessesController'

export default class ProcessTwitch extends BaseTask {
	public static get schedule() {
		return '* 30 * * * *'
	}
	/**
	 * Set enable use .lock file for block run retry task
	 * Lock file save to `build/tmpTaskLock`
	 */
	public static get useLock() {
		return false
	}

	public async handle() {
        
        const processController = new ProcessesController()
        processController.test()
    	
  	}
}
