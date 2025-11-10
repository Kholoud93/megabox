/**
 * Centralized SVG Color Modification Utility
 * Converts various color schemes to indigo palette for consistent branding
 */

/**
 * Modifies SVG content to use indigo color palette
 * @param {string} svgContent - The SVG content as a string
 * @param {Object} options - Configuration options
 * @param {boolean} options.isFirstImage - Use lighter indigo colors (default: false)
 * @param {boolean} options.isThirdImage - Use specific color scheme for third images (default: false)
 * @returns {string} Modified SVG content with indigo colors
 */
export const modifySvgToIndigo = (svgContent, options = {}) => {
    const { isFirstImage = false, isThirdImage = false } = options;
    let modified = svgContent;
    
    // For third image (Stream or Share), use specific color replacements
    if (isThirdImage) {
        // Replace dark teal/cyan colors with indigo
        modified = modified.replace(/#033440/gi, 'rgb(99, 102, 241)'); // indigo-500
        modified = modified.replace(/#263238/gi, 'rgb(79, 70, 229)'); // indigo-600
        
        // Replace red/brown colors with indigo
        modified = modified.replace(/#630f0f/gi, 'rgb(129, 140, 248)'); // indigo-400
        modified = modified.replace(/#7f3e3b/gi, 'rgb(165, 180, 252)'); // indigo-300
        
        // Also replace in style attributes specifically
        modified = modified.replace(/fill:#033440/gi, 'fill:rgb(99, 102, 241)');
        modified = modified.replace(/stroke:#033440/gi, 'stroke:rgb(99, 102, 241)');
        modified = modified.replace(/fill:#263238/gi, 'fill:rgb(79, 70, 229)');
        modified = modified.replace(/stroke:#263238/gi, 'stroke:rgb(79, 70, 229)');
        modified = modified.replace(/fill:#630f0f/gi, 'fill:rgb(129, 140, 248)');
        modified = modified.replace(/stroke:#630f0f/gi, 'stroke:rgb(129, 140, 248)');
        modified = modified.replace(/fill:#7f3e3b/gi, 'fill:rgb(165, 180, 252)');
        modified = modified.replace(/stroke:#7f3e3b/gi, 'stroke:rgb(165, 180, 252)');
    }
    // For first image, use lighter indigo colors
    else if (isFirstImage) {
        // Replace dark teal/cyan colors with lighter indigo
        modified = modified.replace(/#03323D/gi, 'rgb(99, 102, 241)'); // indigo-500
        modified = modified.replace(/#263238/gi, 'rgb(79, 70, 229)'); // indigo-600
        
        // Also replace in style attributes specifically
        modified = modified.replace(/fill:#03323D/gi, 'fill:rgb(99, 102, 241)');
        modified = modified.replace(/stroke:#03323D/gi, 'stroke:rgb(99, 102, 241)');
        modified = modified.replace(/fill:#263238/gi, 'fill:rgb(79, 70, 229)');
        modified = modified.replace(/stroke:#263238/gi, 'stroke:rgb(79, 70, 229)');
    } else {
        // For other images, use darker indigo colors
        modified = modified.replace(/#03323D/gi, 'rgb(55, 48, 163)'); // indigo-800
        modified = modified.replace(/#263238/gi, 'rgb(67, 56, 202)'); // indigo-700
        
        // Also replace in style attributes specifically
        modified = modified.replace(/fill:#03323D/gi, 'fill:rgb(55, 48, 163)');
        modified = modified.replace(/stroke:#03323D/gi, 'stroke:rgb(55, 48, 163)');
        modified = modified.replace(/fill:#263238/gi, 'fill:rgb(67, 56, 202)');
        modified = modified.replace(/stroke:#263238/gi, 'stroke:rgb(67, 56, 202)');
    }
    
    // Purple/Violet colors to indigo
    modified = modified.replace(/rgb\(186,\s*104,\s*200\)/g, 'rgb(99, 102, 241)'); // indigo-500
    modified = modified.replace(/#BA68C8/gi, 'rgb(99, 102, 241)');
    modified = modified.replace(/#ba68c8/gi, 'rgb(99, 102, 241)');
    
    // Replace in style attributes for purple
    modified = modified.replace(/fill:rgb\(186,\s*104,\s*200\)/gi, 'fill:rgb(99, 102, 241)');
    modified = modified.replace(/stroke:rgb\(186,\s*104,\s*200\)/gi, 'stroke:rgb(99, 102, 241)');
    modified = modified.replace(/fill:#BA68C8/gi, 'fill:rgb(99, 102, 241)');
    modified = modified.replace(/stroke:#BA68C8/gi, 'stroke:rgb(99, 102, 241)');
    
    // Dark gray/blue-gray to indigo shades
    modified = modified.replace(/rgb\(69,\s*90,\s*100\)/g, 'rgb(79, 70, 229)'); // indigo-600
    modified = modified.replace(/rgb\(38,\s*50,\s*56\)/g, 'rgb(67, 56, 202)'); // indigo-700
    modified = modified.replace(/rgb\(55,\s*71,\s*79\)/g, 'rgb(55, 48, 163)'); // indigo-800
    
    // Common color replacements to indigo
    // Blue colors to indigo-500/600
    modified = modified.replace(/#3b82f6|#2563eb|#1d4ed8|rgb\(59,\s*130,\s*246\)|rgb\(37,\s*99,\s*235\)|rgb\(29,\s*78,\s*216\)/gi, 'rgb(99, 102, 241)'); // indigo-500
    modified = modified.replace(/#60a5fa|rgb\(96,\s*165,\s*250\)/gi, 'rgb(129, 140, 248)'); // indigo-400
    modified = modified.replace(/#1e40af|rgb\(30,\s*64,\s*175\)/gi, 'rgb(79, 70, 229)'); // indigo-600
    
    // Additional blue shades
    modified = modified.replace(/rgb\(74,\s*143,\s*196\)/g, 'rgb(165, 180, 252)'); // indigo-300 (for uploading animation)
    modified = modified.replace(/#6F90E1/gi, 'rgb(165, 180, 252)'); // indigo-300 (for press-play animation)
    
    // Purple/Violet to indigo
    modified = modified.replace(/#8b5cf6|#7c3aed|rgb\(139,\s*92,\s*246\)|rgb\(124,\s*58,\s*237\)/gi, 'rgb(99, 102, 241)'); // indigo-500
    modified = modified.replace(/#a78bfa|rgb\(167,\s*139,\s*250\)/gi, 'rgb(129, 140, 248)'); // indigo-400
    
    // Teal/Cyan to indigo
    modified = modified.replace(/#06b6d4|#0891b2|rgb\(6,\s*182,\s*212\)|rgb\(8,\s*145,\s*178\)/gi, 'rgb(99, 102, 241)'); // indigo-500
    
    // Light blue to indigo-300
    modified = modified.replace(/#93c5fd|#bfdbfe|rgb\(147,\s*197,\s*253\)|rgb\(191,\s*219,\s*254\)/gi, 'rgb(165, 180, 252)'); // indigo-300
    
    // Dark blue to indigo-700/800
    modified = modified.replace(/#1e3a8a|rgb\(30,\s*58,\s*138\)/gi, 'rgb(67, 56, 202)'); // indigo-700
    
    // Note: Skin tones and light colors are preserved as-is:
    // rgb(200, 133, 106) - skin tone
    // rgb(250, 250, 250) - white/light
    // rgb(245, 245, 245) - light gray
    // rgb(224, 224, 224) - light gray
    // rgb(235, 235, 235) - light gray
    
    return modified;
};

/**
 * Legacy function name for backward compatibility
 * @deprecated Use modifySvgToIndigo instead
 */
export const modifySvgColors = (svgContent, isFirstImage = false, isThirdImage = false) => {
    return modifySvgToIndigo(svgContent, { isFirstImage, isThirdImage });
};

