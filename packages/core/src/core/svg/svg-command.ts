const markerRegEx = /[MmLlSsQqLlHhVvCcSsQqTtAaZz]/g
const digitRegEx = /-?[0-9]*\.?\d+/g

/**
 * Switch SVG Path to SVG Command.
 *
 * @param pathStr
 */
function svgPathToCommands (pathStr: string): ISvgCommand[] {
  const results = []
  let match = markerRegEx.exec(pathStr)
  while (match !== null) {
    results.push(match)
    match = markerRegEx.exec(pathStr)
  }

  return results
    .map(item => ({
      marker: pathStr[item.index],
      index: item.index
    }))
    .reduceRight((all, current) => {
      const chunk = pathStr.substring(current.index, all.length ? all[all.length - 1].index : pathStr.length)
      return all.concat([{
        marker: current.marker,
        index: current.index,
        chunk: (chunk.length > 0) ? chunk.substr(1, chunk.length - 1) : chunk
      }])
    }, [])
    .reverse()
    .map(command => {
      const values = command.chunk.match(digitRegEx)
      return {
        marker: command.marker,
        values: values ? values.map(parseFloat) : []
      }
    })
}

/**
 * Switch SVG Command to SVG Path.
 * @param commands
 */
function svgCommandsToSvgPath (commands: ISvgCommand[]): string {
  return commands
    .map(item => item.marker + ' ' + item.values.join(' '))
    .join(' ')
    .trim()
}

interface ISvgCommand {
  marker: string
  values: number[]
}

export {
  svgCommandsToSvgPath,
  svgPathToCommands,
  ISvgCommand
}
