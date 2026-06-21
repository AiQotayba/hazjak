Send Message

Endpoint: https://metaphilia.com/send-message

Request Body : (JSON If POST)

Parameter Type Required Description
api_key string Yes API Key
sender string Yes Number of your device
number string Yes recipient number ex 72888xxxx|62888xxxx
message string Yes Messsage to be sent

Examplo JSON Request

        {
          "api_key": "1234567890",
          "sender": "62888xxxx",
          "number": "62888xxxx",
          "message": "Hello World"
        }

Send Media API
Method : POST | GET

Endpoint: https://metaphilia.com/send-media

Request Body : (JSON If POST)

Parameter Type Required Description
api_key string Yes API Key
sender string Yes Number of your device
number string Yes recipient number ex 72888xxxx|62888xxxx
media_type string Yes allow : image,video,audio,document
caption string No caption/message
url string Yes URL of media, must direct link
Note: Make sure the url is direct link, not a link from google drive or other cloud storage

Example JSON Request

          {
            "api_key": "1234567890",
            "sender": "62888xxxx",
            "number": "62888xxxx",
            "media_type": "image",
            "caption": "Hello World",
            "url": "https://example.com/image.jpg"
          }





Example URL Request

https://metaphilia.com/send-media?api_key=1234567890&sender=62888xxxx&number=62888xxxx&media_type=image&caption=Hello World&url=https://example.com/image.jpg
