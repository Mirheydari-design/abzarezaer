import { pipeline, env, PipelineType } from '@huggingface/transformers';

// Disable local models to fetch from HF hub
env.allowLocalModels = false;
// Optimize for mobile WebAssembly
env.backends.onnx.wasm.numThreads = 1; 

class PipelineSingleton {
    static task: PipelineType = 'feature-extraction';
    static model = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
    static instance: any = null;

    static async getInstance(progress_callback?: any) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { action, text, id } = event.data;
    
    if (action === 'load') {
        try {
            await PipelineSingleton.getInstance((x: any) => {
                self.postMessage({ status: 'progress', data: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (error) {
            self.postMessage({ status: 'error', error: String(error) });
        }
    }

    if (action === 'extract') {
        try {
            const extractor = await PipelineSingleton.getInstance();
            const output = await extractor(text, { pooling: 'mean', normalize: true });
            
            // Extract the embedding array
            const embedding = Array.from(output.data);
            
            self.postMessage({ status: 'complete', id, embedding });
        } catch (error) {
             self.postMessage({ status: 'error', error: String(error) });
        }
    }
});
