package com.nextcentury.TripletExtraction;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import edu.stanford.nlp.ling.Tag;
import edu.stanford.nlp.trees.LabeledScoredTreeNode;
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

	public Tree extractTriplet(Tree root) {
		Tree triplet = new LabeledScoredTreeNode(new Tag("TRIPLET"));

		/*
		 * The trees that the Stanford parser generates always have a root node
		 * called ROOT and exactly one child node called S which represents the sentence.
		 * Thus, to get the NP and VP subtrees, we must get both grand children of ROOT.
		 */
		Tree subjectTree = extractSubject(root.firstChild().firstChild());
		Tree predicateTree = extractPredicate(root.firstChild().lastChild());
		Tree objectTree = extractObject(root.firstChild().lastChild());

		if(subjectTree == null || predicateTree == null || objectTree == null)
			return null;

		triplet.addChild(subjectTree);
		triplet.addChild(predicateTree);
		triplet.addChild(objectTree);

		return triplet;
	}

	private Tree extractSubject(Tree npSubtree) {

		return findFirstNoun(npSubtree);
	}

	private Tree extractPredicate(Tree vpSubtree) {

		return findDeepestVerb(vpSubtree);
	}

	private Tree extractObject(Tree vpSubtree) {
		String wordType;
		Tree object = null;
		List<Tree> siblings = new ArrayList<Tree>();
		int currentSibling = 0;

		findDecendents(vpSubtree, siblings);

		while(object == null && currentSibling < siblings.size()) {
			wordType = siblings.get(currentSibling).value();

			if(wordType.equalsIgnoreCase("NP") || wordType.equalsIgnoreCase("PP"))
				object = findFirstNoun(siblings.get(currentSibling));
			else
				object = findFirstAdjective(siblings.get(currentSibling));

			currentSibling++;
		}

		return object;
	}

	private Tree findFirstNoun(Tree npSubtree) {
		Tree noun = null;
		int currentChild = 0;

		while(noun == null && currentChild < npSubtree.numChildren()) {

			if(isNoun(npSubtree.getChild(currentChild).value()))
				noun = npSubtree.getChild(currentChild);

			currentChild++;
		}

		return noun.firstChild();
	}

	private Tree findDeepestVerb(Tree vpSubtree) {
		Tree verb = null;

		for(int i = 0; i < vpSubtree.numChildren(); i++) {

			if(vpSubtree.getChild(i).value().equalsIgnoreCase("VP"))
				return findDeepestVerb(vpSubtree.getChild(i));
			else if(isVerb(vpSubtree.getChild(i).value()))
				verb = vpSubtree.getChild(i);
		}

		return verb.firstChild();
	}

	private Tree findFirstAdjective(Tree tree) {
		Tree adjective = null;
		int currentChild = 0;

		while(adjective == null && currentChild < tree.numChildren()) {

			if(isAdjective(tree.getChild(currentChild).value()))
				adjective = tree.getChild(currentChild);

			currentChild++;
		}

		return adjective.firstChild();
	}

	private void findDecendents(Tree tree, List<Tree> siblings) {
		String wordType = tree.value();

		if(wordType.equalsIgnoreCase("NP") || wordType.equalsIgnoreCase("PP") ||
				wordType.equalsIgnoreCase("ADJP"))
			siblings.add(tree);		
		else {

			for(int i = 0; i < tree.numChildren(); i++) {

				if(tree.getChild(i) != null)
					findDecendents(tree.getChild(i), siblings);
			}
		}
	}

	private boolean isNoun(String wordType) {
		return wordType.equalsIgnoreCase("NN") || wordType.equalsIgnoreCase("NNP") ||
				wordType.equalsIgnoreCase("NNPS") || wordType.equalsIgnoreCase("NNS");
	}

	private boolean isVerb(String wordType) {
		return wordType.equalsIgnoreCase("VB") || wordType.equalsIgnoreCase("VBD") ||
				wordType.equalsIgnoreCase("VBG") || wordType.equalsIgnoreCase("VBN") ||
				wordType.equalsIgnoreCase("VBP") || wordType.equalsIgnoreCase("VBZ");
	}

	private boolean isAdjective(String wordType) {
		return wordType.equalsIgnoreCase("JJ") || wordType.equalsIgnoreCase("JJR") ||
				wordType.equalsIgnoreCase("JJS");
	}

	public static void main(String[] args) {
		ExtractionService extractor = new ExtractionService();
		Tree root = extractor.parser.parse("A rare black squirrel has become a regular visitor to a suburban garden").get(0);

		Tree output = extractor.extractTriplet(root);

		if(output == null)
			System.err.println("ERROR: Could not find triplet");
		else
			output.printLocalTree();
	}
}
