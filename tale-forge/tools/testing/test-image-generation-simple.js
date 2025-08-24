// Simple test for OVH AI Stable Diffusion XL endpoint
// Based on official OVH AI documentation

const testImageGeneration = async () => {
  try {
    console.log('🎨 Testing OVH AI Stable Diffusion XL endpoint...');
    
    const url = "https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image";
    const token = process.env.OVH_AI_ENDPOINTS_ACCESS_TOKEN;
    
    if (!token) {
      console.error('❌ Missing OVH_AI_ENDPOINTS_ACCESS_TOKEN environment variable');
      return;
    }
    
    console.log('🔑 Token available:', !!token);
    console.log('🔗 Endpoint:', url);
    
    const data = {
      prompt: "A cute cartoon cat sitting in a garden, children's book illustration style, colorful, simple",
      negative_prompt: "ugly, blurry, low quality, scary, violent"
    };
    
    console.log('🎨 Prompt:', data.prompt);
    console.log('📤 Sending request...');
    
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/octet-stream',
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('📥 Response status:', response.status);
    console.log('⏱️ Request duration:', duration, 'ms');
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 200) {
      const imageBuffer = await response.arrayBuffer();
      console.log('✅ Image generation successful!');
      console.log('📦 Image size:', imageBuffer.byteLength, 'bytes');
      
      if (imageBuffer.byteLength > 0) {
        console.log('🎉 Image generation test PASSED');
      } else {
        console.log('❌ Image buffer is empty');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Image generation failed:', response.status);
      console.error('❌ Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('❌ Full error:', error);
  }
};

// Run the test
testImageGeneration();
