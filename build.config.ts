import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries    : ['./src/core'],
  externals  : ['#imports'],
  declaration: true,
  rollup     : {
    emitCJS  : true,
    cjsBridge: false,
  },
})
