# **Image Generation SDXL API**

The Image Generation or Text-To-Image API endpoint allows you to generate an image from a textual description (prompt).

## **Introduction**

Image Generation refers to the process of automatically generating visual content (such as images) based on textual descriptions provided as input.  
AI Endpoints makes it easy, with ready-to-use inference APIs. Discover how to use them:

## **Model concept and configuration**

This Image Generation API is based on an Open-Source model (Stable Diffusion XL): [stabilityai/stable-diffusion-xl-base-1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0). It takes text as input (the prompt) and returns the corresponding image in color.  
Model configuration:

* Input types: Raw text  
* Language Support: English  
* Output type: 1024x1024 image (bytes)

## **How to?**

The Stable Diffusion XL (SDXL) endpoint offers you an optimized way to generate an image from:

* a prompt, which is a textual description or instruction that is used to guide the model in creating a new image  
* a negative prompt (optional), which is a directive given to the model to specify what should *not be present* in the generated image

Learn how to use them with the following examples:

### With a cURL

Consider changing the *your-access-token* by your token value before running the following command:  
curl \-X POST "https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image" \\  
    \-H 'accept: application/octet-stream' \\  
    \-H 'content-type: application/json' \\  
    \-H 'Authorization: Bearer \<your-access-token\>' \\  
    \-d '{"negative\_prompt":"Ugly, unrealistic","prompt":"Photo of a hippopotamus dressed suit and tie sitting in a coffee shop with a matcha latte, award winning photography, Elke vogelsang, 4k"}' \\  
    \--output \-  
Warning:

* Note that you will get the output image as "bytes" by using \--output \-  
* Consider adding an image filename in the command if you want to save it locally: \--output my\_image.jpeg

### With a simple HTTP client (requests)

First install the *requests* library and *pillow* dependencies:  
pip install requests pillow  
Next, export your access token to the *OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN* environment variable:  
export OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN=\<your-access-token\>  
*If you do not have an access token key yet, follow the instructions in the [AI Endpoints – Getting Started](https://help.ovhcloud.com/csm/en-gb-public-cloud-ai-endpoints-getting-started?id=kb_article_view&sysparm_article=KB0065401).*  
Finally, run the following python code:  
import os  
import io  
import requests  
import json  
from PIL import Image

url \= "https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image"

data \= {  
    "prompt": "Photo of a hippopotamus dressed suit and tie sitting in a coffee shop with a matcha latte, award winning photography, Elke vogelsang, 4k",  
    "negative\_prompt": "Ugly, unrealistic",  
}

headers \= {  
    "accept": "application/octet-stream",  
    "content-type": "application/json",  
    "Authorization": f"Bearer {os.getenv('OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN')}",  
}

response \= requests.post(url, headers=headers, data=json.dumps(data))  
if response.status\_code \== 200:  
    \# Handle response  
    response\_data \= response.content  
    img \= Image.open(io.BytesIO(response\_data))  
    img.show()  
else:  
    print("Error:", response.status\_code)

Image Generation SDXL API  
The Image Generation or Text-To-Image API endpoint allows you to generate an image from a textual description (prompt).  
Introduction  
Image Generation refers to the process of automatically generating visual content (such as images) based on textual descriptions provided as input.  
AI Endpoints makes it easy, with ready-to-use inference APIs. Discover how to use them:  
Model concept and configuration  
This Image Generation API is based on an Open-Source model (Stable Diffusion XL): stabilityai/stable-diffusion-xl-base-1.0. It takes text as input (the prompt) and returns the corresponding image in color.  
Model configuration:  
Input types: Raw text  
Language Support: English  
Output type: 1024x1024 image (bytes)  
How to?  
The Stable Diffusion XL (SDXL) endpoint offers you an optimized way to generate an image from:  
a prompt, which is a textual description or instruction that is used to guide the model in creating a new image  
a negative prompt (optional), which is a directive given to the model to specify what should not be present in the generated image  
Learn how to use them with the following examples:  
With a cURL  
Consider changing the your-access-token by your token value before running the following command:  
curl \-X POST "https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image" \\  
    \-H 'accept: application/octet-stream' \\  
    \-H 'content-type: application/json' \\  
    \-H 'Authorization: Bearer \<your-access-token\>' \\  
    \-d '{"negative\_prompt":"Ugly, unrealistic","prompt":"Photo of a hippopotamus dressed suit and tie sitting in a coffee shop with a matcha latte, award winning photography, Elke vogelsang, 4k"}' \\  
    \--output \-  
Warning:  
Note that you will get the output image as "bytes" by using \--output \-  
Consider adding an image filename in the command if you want to save it locally: \--output my\_image.jpeg  
With a simple HTTP client (requests)  
First install the requests library and pillow dependencies:  
pip install requests pillow  
Next, export your access token to the OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN environment variable:  
export OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN=\<your-access-token\>  
If you do not have an access token key yet, follow the instructions in the AI Endpoints – Getting Started.  
Finally, run the following python code:  
import os  
import io  
import requests  
import json  
from PIL import Image

url \= "https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image"

data \= {  
    "prompt": "Photo of a hippopotamus dressed suit and tie sitting in a coffee shop with a matcha latte, award winning photography, Elke vogelsang, 4k",  
    "negative\_prompt": "Ugly, unrealistic",  
}

headers \= {  
    "accept": "application/octet-stream",  
    "content-type": "application/json",  
    "Authorization": f"Bearer {os.getenv('OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN')}",  
}

response \= requests.post(url, headers=headers, data=json.dumps(data))  
if response.status\_code \== 200:  
    \# Handle response  
    response\_data \= response.content  
    img \= Image.open(io.BytesIO(response\_data))  
    img.show()  
else:  
    print("Error:", response.status\_code)

