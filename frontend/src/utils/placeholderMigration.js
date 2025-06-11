/**
 * Placeholder Service Migration Utility
 * Migrate from unreliable services to reliable ones
 */

export const placeholderMigration = {
  
  /**
   * Service reliability mapping
   */
  serviceReliability: {
    'placehold.co': { reliable: true, rating: 5, description: 'Fast, reliable, modern API' },
    'placeholder.com': { reliable: true, rating: 4, description: 'Generally reliable' },
    'via.placeholder.com': { reliable: false, rating: 2, description: 'Frequently blocked, DNS issues' },
    'picsum.photos': { reliable: false, rating: 3, description: 'Sometimes slow or blocked' },
    'lorempixel.com': { reliable: false, rating: 2, description: 'Often unavailable' },
    'dummyimage.com': { reliable: true, rating: 4, description: 'Usually reliable' },
    'placehold.it': { reliable: false, rating: 2, description: 'Deprecated service' },
    'fakeimg.pl': { reliable: true, rating: 3, description: 'Moderately reliable' }
  },

  /**
   * Convert via.placeholder.com URLs to placehold.co
   */
  convertViaPlaceholderToPlaceholdCo: (url) => {
    if (!url || !url.includes('via.placeholder.com')) {
      return url;
    }

    try {
      // Parse via.placeholder.com URL
      // Format: https://via.placeholder.com/WIDTHxHEIGHT/BGCOLOR/TEXTCOLOR?text=TEXT
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length === 0) return url;
      
      // Extract dimensions
      const dimensions = pathParts[0];
      let width = 300, height = 300;
      
      if (dimensions.includes('x')) {
        [width, height] = dimensions.split('x').map(Number);
      } else {
        width = height = Number(dimensions) || 300;
      }
      
      // Extract colors (optional)
      const bgColor = pathParts[1] || 'f3f4f6';
      const textColor = pathParts[2] || '9ca3af';
      
      // Extract text from query params
      const searchParams = new URLSearchParams(urlObj.search);
      const text = searchParams.get('text') || 'No Image';
      
      // Build placehold.co URL
      // Format: https://placehold.co/WIDTHxHEIGHT/BGCOLOR/TEXTCOLOR?text=TEXT
      const newUrl = `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
      
      console.log(`🔄 Migrated URL: ${url} → ${newUrl}`);
      return newUrl;
      
    } catch (error) {
      console.warn('Failed to convert via.placeholder.com URL:', url, error);
      return `https://placehold.co/300x300?text=${encodeURIComponent('No Image')}`;
    }
  },

  /**
   * Convert any placeholder URL to a reliable alternative
   */
  convertToReliableService: (url) => {
    if (!url || typeof url !== 'string') {
      return 'https://placehold.co/300x300?text=No+Image';
    }

    // If it's already a reliable service, keep it
    const reliableServices = Object.keys(placeholderMigration.serviceReliability)
      .filter(service => placeholderMigration.serviceReliability[service].reliable);
    
    if (reliableServices.some(service => url.includes(service))) {
      return url;
    }

    // Convert via.placeholder.com specifically
    if (url.includes('via.placeholder.com')) {
      return placeholderMigration.convertViaPlaceholderToPlaceholdCo(url);
    }

    // Convert other unreliable services to placehold.co
    if (url.includes('picsum.photos')) {
      // Extract dimensions from picsum.photos/WIDTH/HEIGHT
      const match = url.match(/picsum\.photos\/(\d+)(?:\/(\d+))?/);
      if (match) {
        const width = match[1];
        const height = match[2] || match[1];
        return `https://placehold.co/${width}x${height}?text=Random+Image`;
      }
    }

    if (url.includes('lorempixel.com')) {
      // Extract dimensions from lorempixel.com/WIDTH/HEIGHT
      const match = url.match(/lorempixel\.com\/(\d+)\/(\d+)/);
      if (match) {
        const width = match[1];
        const height = match[2];
        return `https://placehold.co/${width}x${height}?text=Lorem+Pixel`;
      }
    }

    // Default fallback
    return 'https://placehold.co/300x300?text=Placeholder';
  },

  /**
   * Scan and replace all placeholder URLs on the page
   */
  migrateAllImagesOnPage: () => {
    console.group('🔄 MIGRATING PLACEHOLDER URLS');
    
    const images = document.querySelectorAll('img');
    let migratedCount = 0;
    
    images.forEach((img, index) => {
      const originalSrc = img.src;
      const newSrc = placeholderMigration.convertToReliableService(originalSrc);
      
      if (originalSrc !== newSrc) {
        img.src = newSrc;
        migratedCount++;
        console.log(`✅ Migrated image ${index + 1}: ${originalSrc} → ${newSrc}`);
      }
    });
    
    console.log(`✅ Migrated ${migratedCount} images out of ${images.length} total`);
    console.groupEnd();
    
    return migratedCount;
  },

  /**
   * Generate migration report
   */
  generateMigrationReport: () => {
    console.group('📊 PLACEHOLDER SERVICE MIGRATION REPORT');
    
    const images = document.querySelectorAll('img');
    const serviceUsage = {};
    const recommendations = [];
    
    images.forEach(img => {
      const src = img.src;
      
      // Identify service
      for (const [service, info] of Object.entries(placeholderMigration.serviceReliability)) {
        if (src.includes(service)) {
          serviceUsage[service] = (serviceUsage[service] || 0) + 1;
          
          if (!info.reliable) {
            recommendations.push({
              element: img,
              currentService: service,
              currentUrl: src,
              recommendedUrl: placeholderMigration.convertToReliableService(src),
              reason: info.description
            });
          }
          break;
        }
      }
    });
    
    console.log('📈 SERVICE USAGE:');
    Object.entries(serviceUsage).forEach(([service, count]) => {
      const info = placeholderMigration.serviceReliability[service];
      const status = info.reliable ? '✅' : '⚠️';
      console.log(`${status} ${service}: ${count} images (Rating: ${info.rating}/5)`);
    });
    
    if (recommendations.length > 0) {
      console.log('\n🔧 MIGRATION RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. Replace ${rec.currentService}`);
        console.log(`   Current: ${rec.currentUrl}`);
        console.log(`   Recommended: ${rec.recommendedUrl}`);
        console.log(`   Reason: ${rec.reason}`);
      });
      
      console.log(`\n💡 Run placeholderMigration.migrateAllImagesOnPage() to apply fixes`);
    } else {
      console.log('\n🎉 All placeholder services are reliable!');
    }
    
    console.groupEnd();
    
    return {
      serviceUsage,
      recommendations,
      totalImages: images.length,
      reliableImages: images.length - recommendations.length
    };
  },

  /**
   * Test URL conversion
   */
  testConversions: () => {
    console.group('🧪 TESTING URL CONVERSIONS');
    
    const testUrls = [
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/400x200/ff0000/ffffff?text=Test',
      'https://picsum.photos/300/300',
      'https://lorempixel.com/400/300',
      'https://placehold.co/300x300?text=Already+Good',
      'https://broken-url.com/image.jpg'
    ];
    
    testUrls.forEach(url => {
      const converted = placeholderMigration.convertToReliableService(url);
      const isReliable = Object.keys(placeholderMigration.serviceReliability)
        .filter(service => placeholderMigration.serviceReliability[service].reliable)
        .some(service => converted.includes(service));
      
      console.log(`${isReliable ? '✅' : '⚠️'} ${url}`);
      console.log(`   → ${converted}`);
    });
    
    console.groupEnd();
  },

  /**
   * Recommended placeholder URLs for common use cases
   */
  getRecommendedUrls: () => {
    return {
      product: 'https://placehold.co/300x300?text=Product+Image',
      avatar: 'https://placehold.co/100x100?text=Avatar',
      banner: 'https://placehold.co/1200x400?text=Banner+Image',
      thumbnail: 'https://placehold.co/150x150?text=Thumbnail',
      square: 'https://placehold.co/200x200?text=Square+Image',
      landscape: 'https://placehold.co/400x300?text=Landscape',
      portrait: 'https://placehold.co/300x400?text=Portrait',
      hero: 'https://placehold.co/1920x1080?text=Hero+Image',
      card: 'https://placehold.co/350x200?text=Card+Image',
      gallery: 'https://placehold.co/300x300?text=Gallery+Item'
    };
  }
};

// Auto-attach to window for easy access
if (typeof window !== 'undefined') {
  window.placeholderMigration = placeholderMigration;
}

export default placeholderMigration;
