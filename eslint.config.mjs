import ts from 'typescript-eslint';
export default ts.config({ignores:['**/.next/**','node_modules/**','contracts/**','prompts/**']},...ts.configs.recommended,{rules:{'@typescript-eslint/no-explicit-any':'error','@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_'}]}});
