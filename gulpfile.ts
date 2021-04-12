import * as shell from 'gulp-shell'
import * as del from 'del'
import { series } from 'gulp'

export async function cleanup (): Promise<void> {
  await del([
    '**/*.d.ts',
    '**/*.js',
    '**/*.js.map'
  ], {
    ignore: ['**/node_modules/**', 'docs/**']
  })
}

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

export const test = series(cleanup, mocha)
export const coverage = series(cleanup, nyc)

export async function typedoc (): Promise<void> {
  await shell.task('typedoc')()
}
