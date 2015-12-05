#!/usr/bin/env node

const fs = require('fs')
const exec = require('child_process').exec
const watch = require('watch')

interface Dependency {
    name: string
    path: string
}

function getLocalDependencies(path: string) {
    const json = fs.readFileSync(path)
    const data = JSON.parse(json)

    function filterLocalDependencies(map: any) {
        const deps: Array<Dependency> = []
        for (let name in map) {
            if (map[name].startsWith('file:')) {
                deps.push({name, path: map[name].substr(5)})
            }
        }
        return deps
    }

    return [].concat(filterLocalDependencies(data.dependencies))
             .concat(filterLocalDependencies(data.devDependencies))
}

function handleDependencyChange(name: string, path: string) {
    console.log(`'${name}' changed!`)
    exec(`npm install ${path}`)
}

function main() {
    const deps = getLocalDependencies('package.json')

    for (let {path, name} of deps) {
        watch.watchTree(path, handleDependencyChange.bind(this, name, path))
    }
}

main()
