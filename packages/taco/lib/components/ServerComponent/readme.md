# Sevable
https://addyosmani.com/blog/react-server-components/

我这里构思的是通过websocket通信,每个sevable会带有一个唯一的id,请求的时候会带上component.context,然后然后得到vnodetree,然后整个树上的component都会被包装成sevable,当然也有自己的id,然后在一次resp中返回

