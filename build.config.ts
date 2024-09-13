import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input  : './src/core/',
      builder: 'mkdist',
      outDir : 'dist/core',
    },
  ],
  externals  : ['#imports'],
  declaration: true,
  rollup     : {
    emitCJS  : true,
    cjsBridge: false,
  },
})
