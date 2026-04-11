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
    // Copy built assets back into wordpress-plugin/dist for automatic inclusion
    console.log('Copying built React assets into wordpress-plugin/dist...');
    const pluginDist = path.join(pluginSrcDir, 'dist');
    await fs.remove(pluginDist);
    await fs.copy(buildDir, pluginDist);
    console.log('Assets copied to wordpress-plugin/dist.');

        // 3. Create the plugin structure
        console.log('Creating plugin structure...');
        await fs.ensureDir(pluginOutputDir);

        // 4. Copy WordPress plugin files (only main integration file and dist assets)
        console.log('Copying WordPress plugin files...');
        await fs.copy(pluginSrcDir, pluginOutputDir, {
            filter: (src) => {
                const rel = path.relative(pluginSrcDir, src);
                // Always include root directory
                if (rel === '') return true;
                // Include main plugin file
                if (rel === 'siports-integration.php') return true;
                // Include dist assets directory and its contents
                if (rel.startsWith('dist' + path.sep) || rel === 'dist') return true;
                return false;
            }
        });

    // 5. Copy React build files into the plugin's 'dist' directory (expected by PHP loader)
    const distAssetsDir = path.join(pluginOutputDir, 'dist');
    await fs.ensureDir(distAssetsDir);
    await fs.copy(buildDir, distAssetsDir);
    console.log('React build files copied to plugin dist directory.');

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
