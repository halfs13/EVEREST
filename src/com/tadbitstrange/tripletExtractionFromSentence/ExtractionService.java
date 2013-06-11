/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.tadbitstrange.tripletExtractionFromSentence;

import org.apache.log4j.Logger;

import edu.stanford.nlp.trees.Tree;

public class ExtractionService {
	
	private static Logger log = Logger.getLogger(ExtractionService.class);
	CoreNlpParser parser;
	
	public ExtractionService() {
		parser = new CoreNlpParser();
	}
	
	public void checkParserFeedback() {
		Tree tree = parser.parse("My dog has fleas").get(0);
		log.info(tree.label());
		log.info(tree.children()[0].label());
		log.info(tree.children()[0].children()[0].label());
	}
	
	public void tripletExtraction(String s) {
		extractSubject();
		extractPredicate();
		extractObject();
	}
	
	public void extractAttributes(String s, String word) {
		
	}
	
	public void extractSubject() {
		
	}
	
	public void extractPredicate() {
		
	}
	
	public void extractObject() {
		
	}
}
