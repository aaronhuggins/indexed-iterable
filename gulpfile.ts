import * as shell from 'gulp-shell'

export async function lint () {
  await shell.task('ts-standard')()
}

export async function fix () {
  await shell.task('ts-standard --fix')()
}

export async function mocha () {
  await shell.task('mocha')()
}

export async function nyc () {
  await shell.task('nyc mocha')()
}
