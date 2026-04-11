const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const pluginSrcDir = path.join(projectRoot, 'wordpress-plugin');
const buildDir = path.join(projectRoot, 'dist');
const outputDir = path.join(projectRoot, 'plugin-build');
const pluginOutputDir = path.join(outputDir, 'siports-plugin');
const zipOutputPath = path.join(projectRoot, 'siports-plugin.zip');

async function createWordPressPlugin() {
    try {
        console.log('Starting WordPress plugin build process...');

        // 1. Clean up previous builds
        console.log('Cleaning up previous build directories...');
        await fs.remove(buildDir);
        await fs.remove(outputDir);
        await fs.remove(zipOutputPath);

        // 2. Build the React application
        console.log('Building the React application with Vite...');
        execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
        console.log('React application built successfully.');

        // 3. Create the plugin structure
        console.log('Creating plugin structure...');
        await fs.ensureDir(pluginOutputDir);

        // 4. Copy WordPress plugin files
        console.log('Copying WordPress plugin files...');
        await fs.copy(pluginSrcDir, pluginOutputDir, {
            filter: (src) => !src.includes('node_modules') && !src.includes('.DS_Store')
        });

        // 5. Copy React build files into the plugin's 'app' directory
        const appAssetsDir = path.join(pluginOutputDir, 'app');
        await fs.ensureDir(appAssetsDir);
        await fs.copy(buildDir, appAssetsDir);
        console.log('React build files copied to plugin directory.');

        // 6. Create the ZIP archive
        console.log(`Creating ZIP archive at ${zipOutputPath}...`);
        const output = fs.createWriteStream(zipOutputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', function() {
            console.log(`Archive created successfully: ${archive.pointer()} total bytes`);
            console.log(`Plugin is ready at: ${zipOutputPath}`);
        });

        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                console.warn(err);
            } else {
                throw err;
            }
        });

        archive.on('error', function(err) {
            throw err;
        });

        archive.pipe(output);
        archive.directory(pluginOutputDir, 'siports-plugin');
        await archive.finalize();

        // 7. Clean up temporary build folder
        console.log('Cleaning up temporary build directory...');
        await fs.remove(outputDir);

        console.log('Build process completed successfully!');

    } catch (error) {
        console.error('An error occurred during the build process:', error);
        process.exit(1);
    }
}

createWordPressPlugin();
