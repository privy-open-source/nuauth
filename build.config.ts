import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries    : ['./src/index'],
  externals  : ['#imports'],
  declaration: true,
  rollup     : {
    emitCJS  : true,
    cjsBridge: false,
  },
})
