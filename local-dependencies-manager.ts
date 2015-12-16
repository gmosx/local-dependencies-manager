#!/usr/bin/env node

const fs = require('fs')
const exec = require('child_process').exec
const watch = require('watch')
const cli = require('commander')

interface Dependency {
    name: string
    path: string
}

const filePrefix = 'file://'

function getLocalDependencies(path: string): Array<Dependency> {
    const json = fs.readFileSync(path)
    const data = JSON.parse(json)

    function filterLocalDependencies(dependenciesDef: any): Array<Dependency> {
        const dependencies: Array<Dependency> = []
        if (dependenciesDef) {
            for (let name of Object.keys(dependenciesDef)) {
                const url = dependenciesDef[name]
                if (url.startsWith(filePrefix)) {
                    dependencies.push({name, path: url.substr(filePrefix.length)})
                }
            }
        }
        return dependencies
    }

    return [].concat(filterLocalDependencies(data.dependencies))
             .concat(filterLocalDependencies(data.devDependencies))
}

function installDependency(dependency: Dependency): void {
    console.log(`Installing '${dependency.name}' (${dependency.path}).`)
    exec(`npm install ${dependency.path}`)
}

function watchDependency(dependency: Dependency): void {
    console.log(`Watching ${dependency.path}.`)
    watch.watchTree(dependency.path, handleTreeChange.bind(this, dependency))
}

function handleTreeChange(dependency: Dependency) {
    installDependency(dependency)
}

function main(): void {
    cli.version('1.0.2')
            .option('-w, --watch', 'watch mode')
            .parse(process.argv)

    const dependencies = getLocalDependencies('package.json')

    if (cli.watch) {
        dependencies.forEach(watchDependency)
    } else {
        dependencies.forEach(installDependency)
        process.exit()
    }
}

main()
