# ChatApp Setup and Run Instructions

## Prerequisites
### node_module installation
  >npm i
  >whatsappClone>npm i

### Run app
  >node app.js
  >whatsappClone>npm run dev

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/chatApp
ACCOUNT_SID=ACd84fdd63ecd8510a8135ebfb58f5427b
ACCOUNT_AUTH=d9befa621ce322e54895f7c398d349aa
BUS_CONNECTION_URI=Endpoint=sb://chats-service-bus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=3v34BGBWIDCd6d7q1FyWcUuFJtpuJIrDE+ASbKyROJQ=
QUEUE_NAME=whatsappmessage
```
