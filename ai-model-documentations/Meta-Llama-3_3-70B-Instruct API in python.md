# **Example of how to use Meta-Llama-3\_3-70B-Instruct API in python**

## **With a simple HTTP client (requests)**

First install the *requests* library:  
pip install requests  
Next, export your access token to the *OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN* environment variable:  
export OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN=\<your-access-token\>  
*If you do not have an access token key yet, follow the instructions in the [AI Endpoints – Getting Started](https://help.ovhcloud.com/csm/en-gb-public-cloud-ai-endpoints-getting-started?id=kb_article_view&sysparm_article=KB0065401).*  
Finally, run the following python code:  
import os  
import requests  
   
\# You can use the model dedicated URL  
url \= "https://llama-3-3-70b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/openai\_compat/v1/chat/completions"  
\# Or our unified endpoint for easy model switching with optimal OpenAI compatibility  
url \= "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions"  
payload \= {  
    "max\_tokens": 512,  
    "messages": \[  
        {  
            "content": "Explain gravity to a 6 years old",  
            "role": "user"  
        }  
    \],  
    "model": "Meta-Llama-3\_3-70B-Instruct",  
    "temperature": 0,  
}  
   
headers \= {  
    "Content-Type": "application/json",  
    "Authorization": f"Bearer {os.getenv('OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN')}",  
}  
   
response \= requests.post(url, json=payload, headers=headers)  
if response.status\_code \== 200:  
    \# Handle response  
    response\_data \= response.json()  
    \# Parse JSON response  
    choices \= response\_data\["choices"\]  
    for choice in choices:  
        text \= choice\["message"\]\["content"\]  
        \# Process text and finish\_reason  
        print(text)  
else:  
    print("Error:", response.status\_code)

## **With an existing LLM library**

The Meta-Llama-3\_3-70B-Instruct API is compatible with the openai specification.  
First install the *openai* library:  
pip install openai  
Next, export your access token to the *OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN* environment variable:  
export OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN=\<your-access-token\>  
Finally, run the following python code:  
import os

from openai import OpenAI

\# You can use the model dedicated URL  
url \= "https://llama-3-3-70b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/openai\_compat/v1"  
\# Or our unified endpoint for easy model switching with optimal OpenAI compatibility  
url \= "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1

client \= OpenAI(  
    base\_url=url,  
    api\_key=os.getenv("OVH\_AI\_ENDPOINTS\_ACCESS\_TOKEN")  
)

def chat\_completion(new\_message: str) \-\> str:  
    history\_openai\_format \= \[{"role": "user", "content": new\_message}\]

    return client.chat.completions.create(  
        model="Meta-Llama-3\_3-70B-Instruct",  
        messages=history\_openai\_format,  
        temperature=0,  
        max\_tokens=1024  
    ).choices.pop().message.content

if \_\_name\_\_ \== '\_\_main\_\_':  
    print(chat\_completion("Explain gravity for a 6 years old"))   
