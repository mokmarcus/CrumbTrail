# comp20-s2016-team19
COMP20 - Semester Group Project Proposal
Project Title: Foodies/ Crumb Trail
Team: Eric Hochwald, Marcus Mok, Alyssa Fusillo, Shreenath Bhanderi


Problem:
If you are on a trip (especially a road trip) to somewhere, it can be difficult to search for restaurants, cafes or bars that are on the way to your destination. Current restaurant locators (e.g. Yelp, Google) only allows you to find restaurants nearby a particular location. The problem with searching in the vicinity of a single location is that while something might be close to that particular point, it might actually be in an opposite direction to the direction of your destination. Our website, CrumbTrail, will help you find a prefered place to eat without diverting too far from your original google maps route.  

How to solve the problem:
Our service takes your current location and your destination. It then gives you choices of restaurants on the way to your destination according to your preferences. Once you choose your restaurant, the service will then direct you to this restaurant before directing you to your final destination. No longer do you have to manually try to tell which restaurants fall between two points on a map.

List of features:
Geolocation - We will utilize a map feature to pinpoint restaurants along a certain path
Front-end framework - Actually makes our life easier, probably bootstrap and angularjs
Server-side data persistence - We will collect data about users’ food preferences to       best serve their interests. We can use a login system so we have their preferences saved with their username and information
Client-side data persistence - Cookies; tracking user activity
Send emails, SMSes, or push notifications - introductory email after they sign up, possible push notifications if favorite restaurant is coming up soon

Data used by prototype:
User Location through Google Maps API
User Food Preferences - type of food, price range, proximity. 
Restaurant - Google Reviews (JSON)
Traffic 

Algorithms, special techniques: 
Built-in Google Map tools to determine route, traffic etc. It first finds all relevant restaurants that are on a streets that are part of the route, giving preference to streets that closest to where you currently are in your path. Also finds restaurants close to the streets of your route, giving preference to near your current location. 
Add chosen restaurant as updated destination, restores original destination after leaving the restaurant. 

#Comments by Ming
* "Google Reviews (JSON) Traffic" --Google Reviews API also gives you traffic, really?  You may want to talk to Elif or Jade our TAs.  Tell them about your idea and you will know why I sent you to them......
* 14 / 15
