const path = require('path')
const inquirer = require('inquirer')
const PromptModuleAPI = require('./PromptModuleAPI')
const Creator = require('./Creator')
const Generator = require('./Generator')
const clearConsole = require('./utils/clearConsole')
const executeCommand = require('./utils/executeCommand')

async function Create(name) {
    /* const prompts = [
        {
            name: "features",
            message: "Check the features needed for your project:",
            pageSize: 10,
            type: "checkbox",
            choices: [{
                name: "Babel",
                value: "babel",
                short: "Babel",
                description: "Transpile modern JavaScript to older versions (for compatibility)",
                link: "https://babeljs.io/",
                checked: true
            }, {
                name: "Router",
                value: "router",
                description: "Structure the app with dynamic pages",
                link: "https://router.vuejs.org/"
            }, {
                name: "Vuex",
                value: "vuex",
                description: "Manage the app state with a centralized store",
                link: "https://vuex.vuejs.org/"
            }, {
                name: "Linter / Formatter",
                value: "linter",
                short: "Linter",
                description: "Check and enforce code quality with ESLint or Prettier",
                link: "https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint",
                checked: true
            }]
        }, {
            name: "historyMode",
            type: "confirm",
            message: `Use history mode for router? ${chalk.yellow(`(Requires proper server setup for index fallback in production)`)}`,
            description: "By using the HTML5 History API, the URLs don't need the '#' character anymore.",
            link: "https://router.vuejs.org/guide/essentials/history-mode.html"
        }, {
            name: "eslintConfig",
            type: "list",
            message: "Pick a linter / formatter config:",
            description: "Checking code errors and enforcing an homogeoneous code style is recommended."
        }, {
            name: "lintOn",
            message: "Pick additional lint features:",
            type: "checkbox",
            choices: [{
                name: "Lint on save",
                value: "save",
                checked: true
            }, {
                name: "Lint and fix on commit",
                value: "commit"
            }]
        }
    ]; */
    const creator = new Creator()
    // ????????????????????????????????????
    const promptModules = getPromptModules()
    const promptAPI = new PromptModuleAPI(creator)
    promptModules.forEach(m => m(promptAPI))

    // ???????????????
    clearConsole()

    // ?????????????????????????????????????????????
    const answers = await inquirer.prompt(creator.getFinalPrompts())

    // package.json ????????????
    const pkg = {
        name,
        version: '0.1.0',
        dependencies: {},
        devDependencies: {},
    }

    const generator = new Generator(pkg, path.join(process.cwd(), name))
    // ?????? vue webpack ??????????????????????????????
    answers.features.unshift('vue', 'webpack')

    // ?????????????????????????????????????????????????????? package.json ????????????????????????
    // ?????????????????? template ????????????
    answers.features.forEach(feature => {
        require(`./generator/${feature}`)(generator, answers)
    })

    await generator.generate()

    console.log('\n??????????????????...\n')
    // ????????????
    await executeCommand('npm install', path.join(process.cwd(), name))
    console.log('\n??????????????????! ?????????????????????????????????\n')
    console.log(`cd ${name}`)
    console.log(`npm run dev`)
}

function getPromptModules() {
    return [
        'babel',
        'router',
        'vuex',
        'linter',
    ].map(file => require(`./promptModules/${file}`))
}

module.exports = Create