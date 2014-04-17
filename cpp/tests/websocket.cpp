#ifdef STENCILA_TEST_SINGLE
	#define BOOST_TEST_MODULE tests
#endif
#include <boost/test/unit_test.hpp>
#include <boost/filesystem.hpp>

#include <stencila/websocket.hpp>

BOOST_AUTO_TEST_SUITE(websocket)

using namespace Stencila::Websocket;

BOOST_AUTO_TEST_CASE(basic){
	Server server;
	server.start();
	server.stop();
}

BOOST_AUTO_TEST_SUITE_END()
 