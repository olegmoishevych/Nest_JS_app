
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api/blogger/blogs/comments": {
        "get": {
          "operationId": "BloggerController_getCommentsForAllPosts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/blogger/blogs": {
        "get": {
          "operationId": "BloggerController_findBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "BloggerController_createBlog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BlogsDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/api/blogger/blogs/{id}": {
        "delete": {
          "operationId": "BloggerController_deleteBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "BloggerController_updateBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BlogsDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/blogger/blogs/{blogId}/posts": {
        "post": {
          "operationId": "BloggerController_createPostByBlogId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/api/blogger/blogs/{blogId}/posts/{postId}": {
        "put": {
          "operationId": "BloggerController_updatePostByBlogsAndPostsId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "BloggerController_deletePostByBlogsAndPostsId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/blogger/users/{id}/ban": {
        "put": {
          "operationId": "BloggerController_banUserForBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanUserForBloggerDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/blogger/users/blog/{id}": {
        "get": {
          "operationId": "BloggerController_getBannedUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/sa/users": {
        "get": {
          "operationId": "UsersController_findAllUsers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "UsersController_createUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/api/sa/users/{id}": {
        "delete": {
          "operationId": "UsersController_deleteUserById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/sa/blogs/{id}/ban": {
        "put": {
          "operationId": "UsersController_banBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanBlogUserDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/sa/users/{id}/ban": {
        "put": {
          "operationId": "UsersController_banUserById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanUserDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/sa/blogs": {
        "get": {
          "operationId": "UsersController_getBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/sa/quiz/questions": {
        "post": {
          "operationId": "UsersController_createQuizQuestions",
          "parameters": [],
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/api/testing/all-data": {
        "delete": {
          "operationId": "TestingController_deleteAllData",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/posts": {
        "get": {
          "operationId": "PostsController_findPosts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/posts/{id}": {
        "get": {
          "operationId": "PostsController_findPostById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/posts/{postId}/comments": {
        "get": {
          "operationId": "PostsController_findCommentsByPostId",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "PostsController_createCommentByPostId",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CommentsDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/api/posts/{postId}/like-status": {
        "put": {
          "operationId": "PostsController_updateLikeStatusByPostId",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeStatusDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/comments/{id}": {
        "get": {
          "operationId": "CommentsController_findCommentById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/comments/{commentId}": {
        "delete": {
          "operationId": "CommentsController_deleteCommentByCommentId",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "CommentsController_updateCommentByCommentId",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CommentsDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/comments/{commentId}/like-status": {
        "put": {
          "operationId": "CommentsController_updateLikeStatusByCommentId",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeStatusDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/registration": {
        "post": {
          "operationId": "AuthController_userRegistration",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_userRegistrationConfirmation",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_userRegistrationEmailResending",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/login": {
        "post": {
          "operationId": "AuthController_userLogin",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/logout": {
        "post": {
          "operationId": "AuthController_userLogout",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_userRefreshToken",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_userPasswordRecovery",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/new-password": {
        "post": {
          "operationId": "AuthController_userNewPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/NewPasswordDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/auth/me": {
        "get": {
          "operationId": "AuthController_getUser",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/security/devices": {
        "get": {
          "operationId": "DevicesController_getAllDevices",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "DevicesController_deleteAllDevices",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/security/devices/{deviceId}": {
        "delete": {
          "operationId": "DevicesController_deleteDevicesByDeviceId",
          "parameters": [
            {
              "name": "deviceId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/api/blogs": {
        "get": {
          "operationId": "BlogsController_findAllBlogsForUsers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogsController_findPostsByBlogId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/blogs/{id}": {
        "get": {
          "operationId": "BlogsController_findBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      }
    },
    "info": {
      "title": "Bloggers example",
      "description": "The Bloggers API description",
      "version": "1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "Bloggers",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "BlogsDto": {
          "type": "object",
          "properties": {}
        },
        "CreatePostDto": {
          "type": "object",
          "properties": {}
        },
        "BanUserForBloggerDto": {
          "type": "object",
          "properties": {}
        },
        "AuthDto": {
          "type": "object",
          "properties": {}
        },
        "BanBlogUserDto": {
          "type": "object",
          "properties": {}
        },
        "BanUserDto": {
          "type": "object",
          "properties": {}
        },
        "CommentsDto": {
          "type": "object",
          "properties": {}
        },
        "LikeStatusDto": {
          "type": "object",
          "properties": {}
        },
        "NewPasswordDto": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
