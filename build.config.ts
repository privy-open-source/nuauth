import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input  : './src/core/',
      builder: 'mkdist',
      outDir : 'dist/core',
    },
    {
      input : './src/utils.ts',
      outDir: 'dist/',
    },
  ],
  externals  : ['#imports'],
  declaration: true,
  rollup     : {
    emitCJS  : true,
    cjsBridge: false,
  },
})
