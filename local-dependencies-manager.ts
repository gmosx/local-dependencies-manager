#!/usr/bin/env node

const fs = require('fs')
const exec = require('child_process').exec
const watch = require('watch')

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

function handleDependencyChange(name: string, path: string): void {
    console.log(`'${name}' changed!`)
    exec(`npm install ${path}`)
}

function main(): void {
    const dependencies = getLocalDependencies('package.json')

    for (let {path, name} of dependencies) {
        watch.watchTree(path, handleDependencyChange.bind(this, name, path))
    }
}

main()
