import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

/**
 * @param {string} str
 */
const convertDashCaseToPascalCase = (str) => {
  return str.replace(/(^\w|-\w)/g, g => g.replace(/-/, "").toUpperCase())
}

const iconsDirName = "feather-icons/dist/icons"
const iconsDir = `${__dirname}/../node_modules/${iconsDirName}`

const targetDir = `${__dirname}/../src/icons`
await rm(targetDir, { recursive: true, force: true })
await mkdir(targetDir, { recursive: true })

for (const iconFile of await readdir(iconsDir)) {
  const iconImportPath = `${iconsDirName}/${iconFile}`
  const iconName = iconFile.replace(".svg", "")
  const iconJSName = `icon${convertDashCaseToPascalCase(iconName)}`
  const iconJSFileName = `${iconJSName}.ts`

  const code = `import ${iconJSName} from "${iconImportPath}?raw"\nexport default ${iconJSName}\n`

  await writeFile(`${targetDir}/${iconJSFileName}`, code)
}
