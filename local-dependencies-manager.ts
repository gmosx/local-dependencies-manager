#!/usr/bin/env node

const fs = require('fs')
const exec = require('child_process').exec
const watch = require('watch')
const cli = require('commander')

interface Dependency {
    name: string
    path: string
}

function getLocalDependencies(path: string): Array<Dependency> {
    const json = fs.readFileSync(path)
    const data = JSON.parse(json)

    function filterLocalDependencies(dependenciesDef: any): Array<Dependency> {
        const dependencies: Array<Dependency> = []
        for (let name of Object.keys(dependenciesDef)) {
            const url = dependenciesDef[name]
            if (url.startsWith('file:')) {
                dependencies.push({name, path: url.substr(5)})
            }
        }
        return dependencies
    }

    return [].concat(filterLocalDependencies(data.dependencies))
             .concat(filterLocalDependencies(data.devDependencies))
}

function installDependency(dependency: Dependency): void {
    console.log(`Installing '${dependency.name}'.`)
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
    cli.version('1.0.0')
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
